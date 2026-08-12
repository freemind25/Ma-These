// ─── Stytch Integration ──────────────────────────────────────────
// Passwordless auth: OTP (email) + Magic Links

import { getConfig } from './helpers'
import type { StytchOTPResponse, StytchMagicLinkResponse } from './types'

function getStytchHeaders(clientId: string, secret: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
  }
}

/** Send an OTP code to an email address */
export async function stytchSendOTP(email: string): Promise<{
  success: boolean
  messageId?: string
  error?: string
}> {
  const config = await getConfig('stytch')
  if (!config?.enabled || !config.clientId || !config.clientSecret) {
    return { success: false, error: 'Stytch non configuré' }
  }

  const baseUrl = config.domain || 'https://api.stytch.com'

  try {
    const res = await fetch(`${baseUrl}/v1/otps/email/send`, {
      method: 'POST',
      headers: getStytchHeaders(config.clientId, config.clientSecret),
      body: JSON.stringify({ email }),
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.error_message || `HTTP ${res.status}` }
    }

    const data: StytchOTPResponse = await res.json()
    return { success: true, messageId: data.method_id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/** Verify an OTP code */
export async function stytchVerifyOTP(
  methodId: string,
  code: string,
): Promise<{
  success: boolean
  userId?: string
  sessionToken?: string
  error?: string
}> {
  const config = await getConfig('stytch')
  if (!config?.clientId || !config.clientSecret) {
    return { success: false, error: 'Stytch non configuré' }
  }

  const baseUrl = config.domain || 'https://api.stytch.com'

  try {
    const res = await fetch(`${baseUrl}/v1/otps/email/authenticate`, {
      method: 'POST',
      headers: getStytchHeaders(config.clientId, config.clientSecret),
      body: JSON.stringify({ method_id: methodId, code }),
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.error_message || `HTTP ${res.status}` }
    }

    const data = await res.json()
    return {
      success: true,
      userId: data.user_id,
      sessionToken: data.session_token,
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/** Send a magic link to an email address */
export async function stytchSendMagicLink(email: string): Promise<{
  success: boolean
  error?: string
}> {
  const config = await getConfig('stytch')
  if (!config?.enabled || !config.clientId || !config.clientSecret) {
    return { success: false, error: 'Stytch non configuré' }
  }

  const baseUrl = config.domain || 'https://api.stytch.com'

  let extra: Record<string, string> = {}
  if (config.extraConfig) {
    try { extra = JSON.parse(config.extraConfig) } catch { /* ignore */ }
  }

  try {
    const res = await fetch(`${baseUrl}/v1/magic_links/send`, {
      method: 'POST',
      headers: getStytchHeaders(config.clientId, config.clientSecret),
      body: JSON.stringify({
        email,
        login_magic_link_url: extra.loginCallbackUrl || '/api/auth/stytch/verify-magic-link',
        signup_magic_link_url: extra.signupCallbackUrl || '/api/auth/stytch/verify-magic-link',
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.error_message || `HTTP ${res.status}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/** Verify a magic link token */
export async function stytchVerifyMagicLink(token: string): Promise<{
  success: boolean
  userId?: string
  sessionToken?: string
  email?: string
  error?: string
}> {
  const config = await getConfig('stytch')
  if (!config?.clientId || !config.clientSecret) {
    return { success: false, error: 'Stytch non configuré' }
  }

  const baseUrl = config.domain || 'https://api.stytch.com'

  try {
    const res = await fetch(`${baseUrl}/v1/magic_links/authenticate`, {
      method: 'POST',
      headers: getStytchHeaders(config.clientId, config.clientSecret),
      body: JSON.stringify({ token }),
    })

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.error_message || `HTTP ${res.status}` }
    }

    const data = await res.json()
    return {
      success: true,
      userId: data.user_id,
      sessionToken: data.session_token,
      email: data.emails?.[0]?.email || data.user?.emails?.[0]?.email,
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
