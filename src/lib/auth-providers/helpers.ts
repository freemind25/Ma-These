// ─── Auth Provider Helpers (DB CRUD) ────────────────────────────────

import { db } from '@/lib/db'
import type { AuthProviderName, AuthProviderConfig, AuthAccountInfo, WarrantPolicy } from './types'
import { DEFAULT_WARRANT_POLICIES } from './types'

/** Get config for a specific provider */
export async function getConfig(provider: AuthProviderName): Promise<AuthProviderConfig | null> {
  const row = await db.authProvider.findUnique({ where: { provider } })
  if (!row) return null
  return {
    id: row.id,
    provider: row.provider as AuthProviderName,
    enabled: row.enabled,
    clientId: row.clientId,
    clientSecret: row.clientSecret,
    domain: row.domain,
    extraConfig: row.extraConfig,
    connected: row.connected,
    lastTestedAt: row.lastTestedAt?.toISOString(),
  }
}

/** Save / update provider config */
export async function saveConfig(
  provider: AuthProviderName,
  data: { clientId?: string; clientSecret?: string; domain?: string; enabled?: boolean; extraConfig?: string },
) {
  return db.authProvider.upsert({
    where: { provider },
    update: {
      ...data,
      updatedAt: new Date(),
    },
    create: {
      provider,
      ...data,
    },
  })
}

/** Test a provider's API connectivity */
export async function testConnection(provider: AuthProviderName): Promise<{ success: boolean; error?: string }> {
  const config = await getConfig(provider)
  if (!config || !config.clientId) {
    return { success: false, error: 'Configuration manquante' }
  }

  try {
    let success = false
    let error = ''

    if (provider === 'auth0') {
      if (!config.domain) return { success: false, error: 'Domaine requis' }
      // Test by fetching /.well-known/openid-configuration
      const res = await fetch(`${config.domain}/.well-known/openid-configuration`, {
        signal: AbortSignal.timeout(10000),
      })
      if (res.ok) {
        success = true
      } else {
        error = `HTTP ${res.status}`
      }
    } else if (provider === 'stytch') {
      if (!config.clientSecret) return { success: false, error: 'Secret Key requis' }
      // Stytch test: list project
      const baseUrl = config.domain || 'https://api.stytch.com'
      const res = await fetch(`${baseUrl}/v1/projects`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
        },
        signal: AbortSignal.timeout(10000),
      })
      success = res.ok
      if (!success) error = `HTTP ${res.status}`
    } else if (provider === 'warrant') {
      if (!config.clientId) return { success: false, error: 'API Key requise' }
      // Warrant test: list objects
      const baseUrl = config.domain || 'https://api.warrant.dev'
      const res = await fetch(`${baseUrl}/v1/object-types`, {
        headers: {
          Authorization: `ApiKey ${config.clientId}`,
        },
        signal: AbortSignal.timeout(10000),
      })
      // Warrant returns 200 even with no objects
      success = res.ok
      if (!success) error = `HTTP ${res.status}`
    }

    // Update connection status
    await db.authProvider.update({
      where: { provider },
      data: {
        connected: success,
        lastTestedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return { success, error: error || undefined }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await db.authProvider.update({
      where: { provider },
      data: { connected: false, lastTestedAt: new Date(), updatedAt: new Date() },
    })
    return { success: false, error: msg }
  }
}

/** List all providers with their status */
export async function listProviders(): Promise<AuthProviderConfig[]> {
  const rows = await db.authProvider.findMany({
    orderBy: { provider: 'asc' },
  })
  return rows.map((r) => ({
    id: r.id,
    provider: r.provider as AuthProviderName,
    enabled: r.enabled,
    clientId: r.clientId,
    clientSecret: r.clientSecret,
    domain: r.domain,
    extraConfig: r.extraConfig,
    connected: r.connected,
    lastTestedAt: r.lastTestedAt?.toISOString(),
  }))
}

/** List auth accounts for a provider */
export async function listAccounts(provider?: AuthProviderName): Promise<AuthAccountInfo[]> {
  const where = provider ? { provider: { provider } } : {}
  const rows = await db.authAccount.findMany({
    where,
    include: { provider: true },
    orderBy: { lastLoginAt: 'desc' },
    take: 50,
  })
  return rows.map((r) => ({
    id: r.id,
    provider: r.provider.provider as AuthProviderName,
    email: r.email,
    name: r.name,
    avatarUrl: r.avatarUrl,
    lastLoginAt: r.lastLoginAt?.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }))
}

/** Seed default Warrant policies (idempotent) */
export async function seedDefaultPolicies(): Promise<number> {
  let count = 0
  for (const policy of DEFAULT_WARRANT_POLICIES) {
    const upserted = await db.warrantPolicy.upsert({
      where: { policyType_policyKey: { policyType: policy.policyType, policyKey: policy.policyKey } },
      update: { licenseTypes: JSON.stringify(policy.licenseTypes), description: policy.description },
      create: {
        policyType: policy.policyType,
        policyKey: policy.policyKey,
        licenseTypes: JSON.stringify(policy.licenseTypes),
        description: policy.description,
      },
    })
    count++
  }
  return count
}

/** Check if a license type has access to a feature (local DB check, no Warrant API needed) */
export async function checkFeatureAccess(featureKey: string, licenseType: string): Promise<boolean> {
  const policy = await db.warrantPolicy.findUnique({
    where: { policyType_policyKey: { policyType: 'feature_gate', policyKey: featureKey } },
  })
  if (!policy) return true // No policy = open access
  const allowed: string[] = JSON.parse(policy.licenseTypes)
  return allowed.includes(licenseType)
}
