// ─── Auth Providers Hub ────────────────────────────────────────
// Central module for Auth0, Stytch, Warrant integrations

export { PROVIDER_META, DEFAULT_WARRANT_POLICIES } from './types'
export type { AuthProviderName, AuthProviderConfig, AuthAccountInfo, WarrantPolicy, WarrantCheckResult } from './types'

// Re-export helpers
export { getConfig, saveConfig, testConnection, listProviders, listAccounts, seedDefaultPolicies, checkFeatureAccess } from './helpers'
export { auth0AuthorizeUrl, buildAuth0AuthorizeUrl, auth0ExchangeCode, auth0GetUserInfo } from './auth0'
export { stytchSendOTP, stytchVerifyOTP, stytchSendMagicLink, stytchVerifyMagicLink } from './stytch'
export { warrantCheck, warrantListPolicies, warrantCreatePolicy, warrantDeletePolicy, warrantCheckLocal, warrantSyncToAPI } from './warrant'
