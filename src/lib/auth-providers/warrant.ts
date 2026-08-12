// ─── Warrant Integration ──────────────────────────────────────
// Fine-grained authorization & access control

import { db } from '@/lib/db'
import { getConfig } from './helpers'
import type { WarrantCheckResult, WarrantPolicy } from './types'

function getWarrantHeaders(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `ApiKey ${apiKey}`,
  }
}

/** Check authorization via Warrant API (if connected) or local fallback */
export async function warrantCheck(
  object_type: string,
  object_id: string,
  relation: string,
  subject_type: string,
  subject_id: string,
): Promise<WarrantCheckResult> {
  const config = await getConfig('warrant')

  // If Warrant API is configured and connected, use it
  if (config?.enabled && config?.clientId && config?.connected) {
    const baseUrl = config.domain || 'https://api.warrant.dev'

    try {
      const res = await fetch(`${baseUrl}/v1/authorize`, {
        method: 'POST',
        headers: getWarrantHeaders(config.clientId),
        body: JSON.stringify({
          checks: [{
            object: { type: object_type, id: object_id },
            relation,
            subject: { type: subject_type, id: subject_id },
          }],
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const verdict = data?.results?.[0]?.verdict
        return {
          authorized: verdict === 'authorized',
          policyKey: `${object_type}:${relation}`,
          reason: verdict,
        }
      }
    } catch {
      // Fall through to local check
    }
  }

  // Local fallback: check WarrantPolicy table by license type
  return warrantCheckLocal(relation, object_id)
}

/** Local Warrant policy check (no API call) */
export async function warrantCheckLocal(
  featureKey: string,
  licenseType: string,
): Promise<WarrantCheckResult> {
  const policy = await db.warrantPolicy.findUnique({
    where: { policyType_policyKey: { policyType: 'feature_gate', policyKey: featureKey } },
  })

  if (!policy) {
    // No policy defined = open access
    return { authorized: true, policyKey: featureKey, reason: 'no_policy' }
  }

  try {
    const allowed: string[] = JSON.parse(policy.licenseTypes)
    const isAuthorized = allowed.includes(licenseType)
    return {
      authorized: isAuthorized,
      policyKey: featureKey,
      reason: isAuthorized ? 'granted_by_policy' : 'insufficient_license',
    }
  } catch {
    return { authorized: true, policyKey: featureKey, reason: 'parse_error' }
  }
}

/** List all Warrant policies from local DB */
export async function warrantListPolicies(): Promise<WarrantPolicy[]> {
  const rows = await db.warrantPolicy.findMany({
    orderBy: [{ policyType: 'asc' }, { policyKey: 'asc' }],
  })
  return rows.map((r) => ({
    id: r.id,
    policyType: r.policyType,
    policyKey: r.policyKey,
    licenseTypes: JSON.parse(r.licenseTypes || '[]'),
    description: r.description,
  }))
}

/** Create or update a Warrant policy */
export async function warrantCreatePolicy(data: {
  policyType: string
  policyKey: string
  licenseTypes: string[]
  description?: string
}): Promise<WarrantPolicy> {
  const row = await db.warrantPolicy.upsert({
    where: { policyType_policyKey: { policyType: data.policyType, policyKey: data.policyKey } },
    update: {
      licenseTypes: JSON.stringify(data.licenseTypes),
      description: data.description,
    },
    create: {
      policyType: data.policyType,
      policyKey: data.policyKey,
      licenseTypes: JSON.stringify(data.licenseTypes),
      description: data.description,
    },
  })
  return {
    id: row.id,
    policyType: row.policyType,
    policyKey: row.policyKey,
    licenseTypes: JSON.parse(row.licenseTypes),
    description: row.description,
  }
}

/** Delete a Warrant policy */
export async function warrantDeletePolicy(policyId: string): Promise<boolean> {
  try {
    await db.warrantPolicy.delete({ where: { id: policyId } })
    return true
  } catch {
    return false
  }
}

/** Sync local policies to Warrant API (if connected) */
export async function warrantSyncToAPI(): Promise<{ synced: number; errors: number }> {
  const config = await getConfig('warrant')
  if (!config?.enabled || !config.clientId || !config.connected) {
    return { synced: 0, errors: 0 }
  }

  const policies = await warrantListPolicies()
  let synced = 0
  let errors = 0

  const baseUrl = config.domain || 'https://api.warrant.dev'

  for (const policy of policies) {
    if (policy.policyType !== 'feature_gate') continue

    try {
      // Create object type in Warrant if not exists
      await fetch(`${baseUrl}/v1/object-types/${policy.policyKey}`, {
        method: 'PUT',
        headers: getWarrantHeaders(config.clientId),
        body: JSON.stringify({ type: policy.policyKey }),
      })
      synced++
    } catch {
      errors++
    }
  }

  return { synced, errors }
}
