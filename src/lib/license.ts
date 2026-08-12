// ─── License Key Utility ─────────────────────────────────────
// Format: TF-XXXX-XXXX-XXXX-XXXX (19 chars total)
// Charset excludes ambiguous chars (O/0, I/1/L)

import { createHash, randomBytes } from 'crypto'

const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** Generate a new license key: TF-XXXX-XXXX-XXXX-XXXX */
export function generateLicenseKey(): string {
  const groups: string[] = []
  for (let g = 0; g < 4; g++) {
    let chunk = ''
    for (let c = 0; c < 4; c++) {
      const byte = randomBytes(1)[0]
      chunk += CHARSET[byte % CHARSET.length]
    }
    groups.push(chunk)
  }
  return `TF-${groups.join('-')}`
}

/** Hash a license key with SHA-256 for storage */
export function hashKey(key: string): string {
  const normalized = key.trim().toUpperCase()
  return createHash('sha256').update(normalized).digest('hex')
}

/** Extract first 8 chars for admin display (TF-XXXX-X) */
export function keyPrefix(key: string): string {
  return key.trim().toUpperCase().slice(0, 9)
}

/** Validate key format */
export function isValidKeyFormat(key: string): boolean {
  const normalized = key.trim().toUpperCase()
  return /^TF-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(normalized)
}

/** Generate a secure session token */
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

/** Compute a simple device fingerprint from user-agent */
export function fingerprintDevice(userAgent?: string): string {
  const raw = userAgent || 'unknown'
  return createHash('sha256').update(raw.slice(0, 200)).digest('hex').slice(0, 16)
}

/** License type labels (French) */
export const LICENSE_TYPE_LABELS: Record<string, string> = {
  trial: 'Essai (7 jours)',
  academic: 'Académique',
  standard: 'Standard',
  premium: 'Premium',
}

/** Default activation limits per type */
export const LICENSE_TYPE_LIMITS: Record<string, number> = {
  trial: 1,
  academic: 2,
  standard: 3,
  premium: 5,
}

/** Default durations per type (days, null = never expires) */
export const LICENSE_TYPE_DURATIONS: Record<string, number | null> = {
  trial: 7,
  academic: 365,
  standard: null,
  premium: null,
}
