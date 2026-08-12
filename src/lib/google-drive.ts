import { db } from '@/lib/db'
import { encrypt, decrypt } from '@/lib/crypto'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_DRIVE_API = 'https://www.googleapis.com/drive/v3'
const GOOGLE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3'

export interface GoogleTokens {
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
  // Strip trailing slash to match Google's strict rules
  const clean = base.replace(/\/+$/, '')
  return `${clean}/api/cloud-drive/callback`
}

/**
 * Build Google OAuth consent URL
 */
export function getGoogleAuthUrl(state?: string, baseUrl?: string): string {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID
  const redirectUri = buildRedirectUri(baseUrl)

  if (!clientId) throw new Error('GOOGLE_DRIVE_CLIENT_ID not configured')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/drive.file',
    access_type: 'offline',
    prompt: 'consent',
    ...(state ? { state } : {}),
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCode(code: string, baseUrl?: string): Promise<GoogleTokens> {
  const redirectUri = buildRedirectUri(baseUrl)

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_DRIVE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET!,
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
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_DRIVE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token refresh failed: ${err}`)
  }

  const data = await res.json()
  // Update DB with fresh token (encrypted)
  const conn = await db.cloudDriveConnection.findFirst({ where: { provider: 'google_drive' } })
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
  const conn = await db.cloudDriveConnection.findFirst({ where: { provider: 'google_drive' } })

  if (!conn?.accessToken) throw new Error('Google Drive not connected')

  const accessToken = decrypt(conn.accessToken)
  if (!accessToken) throw new Error('Google Drive not connected')

  // Check if token is expired (with 5 min buffer)
  if (conn.tokenExpiresAt && new Date(conn.tokenExpiresAt).getTime() - Date.now() < 300_000) {
    const refreshToken = decrypt(conn.refreshToken)
    if (!refreshToken) throw new Error('No refresh token available')
    return refreshAccessToken(refreshToken)
  }

  return accessToken
}

/**
 * Get user profile from Google
 */
export async function getGoogleProfile(accessToken: string): Promise<{ email: string; name: string }> {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('Failed to fetch Google profile')
  const data = await res.json()
  return { email: data.email, name: data.name || data.given_name || '' }
}

/**
 * Ensure a ThesisFrame folder exists in Drive, return its ID
 */
export async function ensureDriveFolder(accessToken: string, folderName = 'ThesisFrame'): Promise<string> {
  // Search for existing folder
  const query = encodeURIComponent(`name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`)
  const res = await fetch(`${GOOGLE_DRIVE_API}/files?q=${query}&spaces=drive&fields=files(id)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (res.ok) {
    const data = await res.json()
    if (data.files?.length > 0) return data.files[0].id
  }

  // Create folder
  const createRes = await fetch(`${GOOGLE_DRIVE_API}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  })

  if (!createRes.ok) throw new Error('Failed to create ThesisFrame folder')
  const folder = await createRes.json()
  return folder.id
}

/**
 * Upload a file to Google Drive
 */
export async function uploadToDrive(
  fileName: string,
  fileContent: Buffer | string,
  mimeType: string,
  folderId?: string,
): Promise<DriveFile> {
  const accessToken = await getValidAccessToken()
  const targetFolder = folderId || await ensureDriveFolder(accessToken)

  const metadata = {
    name: fileName,
    mimeType,
    parents: [targetFolder],
  }

  const boundary = 'thesisframe_boundary'
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n` +
    `${typeof fileContent === 'string' ? fileContent : fileContent.toString('binary')}\r\n` +
    `--${boundary}--`

  const res = await fetch(`${GOOGLE_UPLOAD_API}/files?uploadType=multipart&fields=id,name,webViewLink,createdTime`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Upload failed: ${err}`)
  }

  return res.json()
}

/**
 * List files in the ThesisFrame folder
 */
export async function listDriveFiles(limit = 10): Promise<DriveFile[]> {
  const accessToken = await getValidAccessToken()
  const folderId = await ensureDriveFolder(accessToken)
  const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`)

  const res = await fetch(
    `${GOOGLE_DRIVE_API}/files?q=${query}&orderBy=modifiedTime desc&pageSize=${limit}&fields=files(id,name,webViewLink,createdTime)`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )

  if (!res.ok) return []
  const data = await res.json()
  return data.files || []
}
