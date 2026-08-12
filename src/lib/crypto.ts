/**
 * AES-256-GCM encryption/decryption for sensitive tokens.
 * 
 * Uses Node.js crypto module (synchronous, no Web Crypto API).
 * 
 * Key: ENCRYPTION_KEY env var (64-char hex string = 32 bytes).
 * Falls back to a deterministic dev key in non-production.
 * 
 * Output format: base64( iv[12] || ciphertext || authTag[16] )
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

function getKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY
  if (!envKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY env var is required in production')
    }
    // Deterministic dev-only key (32 bytes)
    return Buffer.from('thesisframe_dev_key_0000000000000000', 'utf8')
  }
  const key = Buffer.from(envKey, 'hex')
  if (key.length !== 32) {
    throw new Error(`ENCRYPTION_KEY must be 32 bytes (64 hex chars), got ${key.length}`)
  }
  return key
}

/**
 * Encrypt a plaintext string. Returns base64-encoded string, or null if input is falsy.
 */
export function encrypt(plaintext: string | null | undefined): string | null {
  if (!plaintext) return null

  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
    cipher.getAuthTag(),
  ])

  // Prepend IV for self-contained ciphertext
  const combined = Buffer.concat([iv, encrypted])
  return combined.toString('base64')
}

/**
 * Decrypt a base64-encoded ciphertext. Returns plaintext string, or null if input is falsy.
 * If decryption fails (corrupt data, wrong key, or legacy plaintext), returns raw value
 * to avoid breaking existing data during migration.
 */
export function decrypt(ciphertext: string | null | undefined): string | null {
  if (!ciphertext) return null

  // Quick heuristic: if it looks like a plain OAuth token (starts with alphanumeric, no base64 padding issues),
  // and is NOT base64-encoded, it's likely a legacy plaintext value.
  // Real encrypted values are always longer due to IV + authTag overhead.
  const buf = Buffer.from(ciphertext, 'base64')
  const minEncryptedLength = IV_LENGTH + AUTH_TAG_LENGTH + 1 // iv + tag + at least 1 byte

  if (buf.length < minEncryptedLength) {
    // Too short to be encrypted — treat as legacy plaintext
    return ciphertext
  }

  try {
    const key = getKey()
    const iv = buf.subarray(0, IV_LENGTH)
    const authTag = buf.subarray(buf.length - AUTH_TAG_LENGTH)
    const encrypted = buf.subarray(IV_LENGTH, buf.length - AUTH_TAG_LENGTH)

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ])

    return decrypted.toString('utf8')
  } catch {
    // Decryption failed — likely a legacy plaintext token
    console.warn('[crypto] Decryption failed — returning raw value (legacy plaintext)')
    return ciphertext
  }
}

/**
 * Check if a value looks like it's already encrypted (base64, long enough).
 * Useful for conditional re-encryption.
 */
export function isEncrypted(value: string | null | undefined): boolean {
  if (!value) return false
  try {
    const buf = Buffer.from(value, 'base64')
    return buf.length >= IV_LENGTH + AUTH_TAG_LENGTH + 1
  } catch {
    return false
  }
}
