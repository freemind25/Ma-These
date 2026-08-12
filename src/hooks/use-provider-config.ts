'use client'

import { useCallback } from 'react'

interface ProviderConfig {
  provider: string
  apiKey: string
  baseUrl: string
  model: string
}

/**
 * Read AI provider settings from localStorage.
 * Returns null if Z.ai (default) is selected (no extra config needed).
 */
function readProviderConfig(): ProviderConfig | null {
  if (typeof window === 'undefined') return null
  const provider = localStorage.getItem('tf_provider') || 'z-ai'
  if (provider === 'z-ai') return null
  return {
    provider,
    apiKey: localStorage.getItem('tf_apiKey') || '',
    baseUrl: localStorage.getItem('tf_baseUrl') || '',
    model: localStorage.getItem('tf_model') || '',
  }
}

/**
 * Enrich a request body with provider config if an external provider is selected.
 * Usage: body = withProviderConfig(body)
 */
export function withProviderConfig(body: Record<string, unknown>): Record<string, unknown> {
  const config = readProviderConfig()
  if (!config || !config.apiKey || !config.baseUrl) return body
  return {
    ...body,
    provider: config.provider,
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    model: config.model,
  }
}

/**
 * React hook that returns a function to get current provider config.
 */
export function useProviderConfig() {
  const getProviderBody = useCallback(() => {
    const config = readProviderConfig()
    if (!config || !config.apiKey || !config.baseUrl) return null
    return config
  }, [])

  const isActive = useCallback(() => {
    const config = readProviderConfig()
    return !!config && !!config.apiKey && !!config.baseUrl
  }, [])

  return { getProviderBody, isActive }
}
