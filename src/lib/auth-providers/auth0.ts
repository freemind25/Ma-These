// ─── Auth0 Integration ───────────────────────────────────────────
// OAuth2 Authorization Code flow

import { getConfig, saveConfig } from './helpers'
import type { Auth0UserInfo } from './types'

const AUTH0_SCOPES = 'openid profile email'
const AUTH0_AUDIENCE = '' // Set in extraConfig if needed

/** Generate the Auth0 authorize URL for redirect-based login */
export function auth0AuthorizeUrl(callbackUrl?: string): string | null {
  // We can't call getConfig() synchronously in a server component redirect,
  // so this function requires the config to be passed in.
  // For the API route, we'll use async version.
  return null // Use the API route instead
}

/** Build Auth0 authorize URL from config */
export async function buildAuth0AuthorizeUrl(state?: string): Promise<{ url: string; error?: string }> {
  const config = await getConfig('auth0')
  if (!config?.enabled || !config.clientId || !config.domain) {
    return { url: '', error: 'Auth0 non configuré' }
  }

  let extra: Record<string, string> = {}
  if (config.extraConfig) {
    try { extra = JSON.parse(config.extraConfig) } catch { /* ignore */ }
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: extra.callbackUrl || '/api/auth/auth0/callback',
    scope: extra.scopes || AUTH0_SCOPES,
    state: state || crypto.randomUUID(),
  })

  if (extra.audience) {
    params.set('audience', extra.audience)
  }

  return { url: `${config.domain}/authorize?${params.toString()}` }
}

/** Exchange authorization code for tokens */
export async function auth0ExchangeCode(code: string): Promise<{
  success: boolean
  accessToken?: string
  refreshToken?: string
  expiresAt?: string
  error?: string
}> {
  const config = await getConfig('auth0')
  if (!config?.clientId || !config.clientSecret || !config.domain) {
    return { success: false, error: 'Auth0 non configuré' }
  }

  let extra: Record<string, string> = {}
  if (config.extraConfig) {
    try { extra = JSON.parse(config.extraConfig) } catch { /* ignore */ }
  }

  try {
    const tokenRes = await fetch(`${config.domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: extra.callbackUrl || '/api/auth/auth0/callback',
      }),
    })

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text()
      return { success: false, error: `Token exchange failed: ${tokenRes.status} ${errBody}` }
    }

    const tokens = await tokenRes.json()
    return {
      success: true,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : undefined,
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/** Get user info from Auth0 */
export async function auth0GetUserInfo(accessToken: string): Promise<Auth0UserInfo | null> {
  const config = await getConfig('auth0')
  if (!config?.domain) return null

  try {
    const res = await fetch(`${config.domain}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
