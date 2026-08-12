import { db } from '@/lib/db'
import { encrypt, decrypt } from '@/lib/crypto'

const BOX_TOKEN_URL = 'https://api.box.com/oauth2/token'
const BOX_AUTHORIZE_URL = 'https://account.box.com/api/oauth2/authorize'
const BOX_API_BASE = 'https://api.box.com/2.0'
const BOX_UPLOAD_API = 'https://upload.box.com/api/2.0/files/content'

export interface BoxTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface DriveFile {
  id: string
  name: string
  webViewLink: string
  createdTime: string
}

/**
 * Build the OAuth redirect URI (always absolute)
 * @param baseUrl Override base URL (from request headers in API routes)
 */
export function buildRedirectUri(baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL
  if (!base) {
    throw new Error(
      'NEXT_PUBLIC_APP_URL is not set. Add it to .env, e.g. NEXT_PUBLIC_APP_URL=https://these-frame.vercel.app',
    )
  }
  // Strip trailing slash to match Box's strict rules
  const clean = base.replace(/\/+$/, '')
  return `${clean}/api/box-drive/callback`
}

/**
 * Build Box OAuth consent URL
 */
export function getBoxAuthUrl(state?: string, baseUrl?: string): string {
  const clientId = process.env.BOX_CLIENT_ID
  const redirectUri = buildRedirectUri(baseUrl)

  if (!clientId) throw new Error('BOX_CLIENT_ID not configured')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'root_readwrite',
    ...(state ? { state } : {}),
  })

  return `${BOX_AUTHORIZE_URL}?${params.toString()}`
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCode(code: string, baseUrl?: string): Promise<BoxTokens> {
  const redirectUri = buildRedirectUri(baseUrl)

  const res = await fetch(BOX_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.BOX_CLIENT_ID!,
      client_secret: process.env.BOX_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token exchange failed: ${err}`)
  }

  const data = await res.json()
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  }
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch(BOX_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.BOX_CLIENT_ID!,
      client_secret: process.env.BOX_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token refresh failed: ${err}`)
  }

  const data = await res.json()
  // Update DB with fresh token (encrypted)
  const conn = await db.cloudDriveConnection.findFirst({ where: { provider: 'box' } })
  if (conn) {
    const expiresAt = new Date(Date.now() + data.expires_in * 1000)
    await db.cloudDriveConnection.update({
      where: { id: conn.id },
      data: {
        accessToken: encrypt(data.access_token),
        refreshToken: encrypt(data.refresh_token || refreshToken),
        tokenExpiresAt: expiresAt,
      },
    })
  }
  return data.access_token
}

/**
 * Get a valid access token (refresh if needed)
 */
export async function getValidAccessToken(): Promise<string> {
  const conn = await db.cloudDriveConnection.findFirst({ where: { provider: 'box' } })

  if (!conn?.accessToken) throw new Error('Box not connected')

  const accessToken = decrypt(conn.accessToken)
  if (!accessToken) throw new Error('Box not connected')

  // Check if token is expired (with 5 min buffer)
  if (conn.tokenExpiresAt && new Date(conn.tokenExpiresAt).getTime() - Date.now() < 300_000) {
    const refreshToken = decrypt(conn.refreshToken)
    if (!refreshToken) throw new Error('No refresh token available')
    return refreshAccessToken(refreshToken)
  }

  return accessToken
}

/**
 * Get user profile from Box
 */
export async function getBoxProfile(accessToken: string): Promise<{ email: string; name: string }> {
  const res = await fetch(`${BOX_API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('Failed to fetch Box profile')
  const data = await res.json()
  return { email: data.login, name: data.name || '' }
}

/**
 * Ensure a ThesisFrame folder exists in Box, return its ID
 */
export async function ensureDriveFolder(accessToken: string, folderName = 'ThesisFrame'): Promise<string> {
  // List items in root folder (id='0') to find existing folder
  const res = await fetch(`${BOX_API_BASE}/folders/0/items?fields=id,name,type&limit=100`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (res.ok) {
    const data = await res.json()
    const existing = data.entries?.find(
      (item: { type: string; name: string }) => item.type === 'folder' && item.name === folderName,
    )
    if (existing) return existing.id
  }

  // Create folder
  const createRes = await fetch(`${BOX_API_BASE}/folders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      parent: { id: '0' },
    }),
  })

  if (!createRes.ok) throw new Error('Failed to create ThesisFrame folder')
  const folder = await createRes.json()
  return folder.id
}

/**
 * Upload a file to Box
 */
export async function uploadToDrive(
  fileName: string,
  fileContent: Buffer | string,
  mimeType: string,
  folderId?: string,
): Promise<DriveFile> {
  const accessToken = await getValidAccessToken()
  const targetFolder = folderId || (await ensureDriveFolder(accessToken))

  // Box uses multipart/form-data with 'attributes' (JSON) and 'file' parts
  const formData = new FormData()
  const attributes = JSON.stringify({
    name: fileName,
    parent: { id: targetFolder },
  })
  formData.append('attributes', attributes)
  formData.append('file', new Blob([fileContent], { type: mimeType }), fileName)

  const res = await fetch(BOX_UPLOAD_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Upload failed: ${err}`)
  }

  const data = await res.json()
  const entry = data.entries?.[0]
  return {
    id: entry.id,
    name: entry.name,
    webViewLink: entry.shared_link?.url || `https://app.box.com/file/${entry.id}`,
    createdTime: entry.created_at,
  }
}

/**
 * List files and folders in the ThesisFrame folder
 */
export async function listDriveItems(limit = 50): Promise<Array<{id:string;name:string;type:string;created_at?:string;modified_at?:string;size?:number}>> {
  const accessToken = await getValidAccessToken()
  const folderId = await ensureDriveFolder(accessToken)

  const res = await fetch(
    `${BOX_API_BASE}/folders/${folderId}/items?fields=id,name,created_at,modified_at,size,type&limit=${limit}&sort=modified_at&direction=DESC`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )

  if (!res.ok) return []
  const data = await res.json()
  return data.entries || []
}

/**
 * Create a subfolder in the ThesisFrame folder
 */
export async function createFolder(folderName: string, parentFolderId?: string): Promise<{id:string;name:string}> {
  const accessToken = await getValidAccessToken()
  const parentId = parentFolderId || (await ensureDriveFolder(accessToken))

  const res = await fetch(`${BOX_API_BASE}/folders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: folderName, parent: { id: parentId } }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Folder creation failed: ${err}`)
  }
  return res.json()
}

/**
 * Delete a file or folder from Box
 */
export async function deleteItem(itemId: string, itemType: 'file' | 'folder' = 'file'): Promise<void> {
  const accessToken = await getValidAccessToken()
  const url = itemType === 'folder'
    ? `${BOX_API_BASE}/folders/${itemId}?recursive=true`
    : `${BOX_API_BASE}/files/${itemId}`
  const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok && res.status !== 204) {
    const err = await res.text()
    throw new Error(`Delete failed: ${err}`)
  }
}
