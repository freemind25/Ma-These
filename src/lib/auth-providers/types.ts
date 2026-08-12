// ─── Auth Provider Types ────────────────────────────────────────

export type AuthProviderName = 'auth0' | 'stytch' | 'warrant'

export interface AuthProviderConfig {
  id: string
  provider: AuthProviderName
  enabled: boolean
  clientId?: string | null
  clientSecret?: string | null
  domain?: string | null
  extraConfig?: string | null
  connected: boolean
  lastTestedAt?: string | null
}

export interface AuthAccountInfo {
  id: string
  provider: AuthProviderName
  email?: string | null
  name?: string | null
  avatarUrl?: string | null
  lastLoginAt?: string | null
  createdAt: string
}

export interface Auth0UserInfo {
  sub: string
  email?: string
  name?: string
  nickname?: string
  picture?: string
  email_verified?: boolean
}

export interface StytchOTPResponse {
  user_id: string
  email_id: string
  method_id: string
}

export interface StytchMagicLinkResponse {
  user_id: string
  email_id: string
}

export interface WarrantCheckResult {
  authorized: boolean
  policyKey: string
  reason?: string
}

export interface WarrantPolicy {
  id: string
  policyType: string
  policyKey: string
  licenseTypes: string[]
  description?: string | null
}

// Provider display metadata (no API key needed)
export const PROVIDER_META: Record<AuthProviderName, {
  name: string
  description: string
  icon: string
  color: string
  docsUrl: string
  configFields: { key: string; label: string; placeholder: string; type: 'text' | 'password'; required: boolean }[]
}> = {
  auth0: {
    name: 'Auth0',
    description: 'Authentification OAuth/social (Google, GitHub, SSO universitaire)',
    icon: 'Shield',
    color: 'text-emerald-600',
    docsUrl: 'https://auth0.com/docs',
    configFields: [
      { key: 'clientId', label: 'Client ID', placeholder: 'votre-client-id', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', placeholder: 'votre-client-secret', type: 'password', required: true },
      { key: 'domain', label: 'Domaine', placeholder: 'votre-tenant.eu.auth0.com', type: 'text', required: true },
    ],
  },
  stytch: {
    name: 'Stytch',
    description: 'Authentification sans mot de passe (magic links, OTP)',
    icon: 'KeyRound',
    color: 'text-violet-600',
    docsUrl: 'https://stytch.com/docs',
    configFields: [
      { key: 'clientId', label: 'Project ID', placeholder: 'project-live-xxx', type: 'text', required: true },
      { key: 'clientSecret', label: 'Secret Key', placeholder: 'secret-live-xxx', type: 'password', required: true },
      { key: 'domain', label: 'API URL', placeholder: 'https://api.stytch.com', type: 'text', required: false },
    ],
  },
  warrant: {
    name: 'Warrant',
    description: 'Autorisation fine et contrôle d\'accès par type de licence',
    icon: 'Lock',
    color: 'text-amber-600',
    docsUrl: 'https://warrant.dev/docs',
    configFields: [
      { key: 'clientId', label: 'API Key', placeholder: 'your-warrant-api-key', type: 'text', required: true },
      { key: 'domain', label: 'API URL', placeholder: 'https://api.warrant.dev', type: 'text', required: false },
    ],
  },
}

// Default Warrant policies mapped to license types
export const DEFAULT_WARRANT_POLICIES: {
  policyType: string
  policyKey: string
  licenseTypes: string[]
  description: string
}[] = [
  // AI features
  { policyType: 'feature_gate', policyKey: 'ai_writing', licenseTypes: ['academic', 'standard', 'premium'], description: 'Rédaction assistée par IA' },
  { policyType: 'feature_gate', policyKey: 'ai_chat', licenseTypes: ['academic', 'standard', 'premium'], description: 'Chat assistant IA' },
  { policyType: 'feature_gate', policyKey: 'ai_directeur', licenseTypes: ['standard', 'premium'], description: 'Simulateur de directeur de thèse' },
  { policyType: 'feature_gate', policyKey: 'ai_cadrage', licenseTypes: ['academic', 'standard', 'premium'], description: 'Génération de cadrage' },
  { policyType: 'feature_gate', policyKey: 'ai_humanizer', licenseTypes: ['premium'], description: 'Humanisation de texte' },
  { policyType: 'feature_gate', policyKey: 'ai_automation', licenseTypes: ['premium'], description: 'Pipelines d\'automatisation IA' },
  // Export features
  { policyType: 'feature_gate', policyKey: 'export_pdf', licenseTypes: ['academic', 'standard', 'premium'], description: 'Export PDF' },
  { policyType: 'feature_gate', policyKey: 'export_docx', licenseTypes: ['standard', 'premium'], description: 'Export DOCX' },
  { policyType: 'feature_gate', policyKey: 'export_pptx', licenseTypes: ['standard', 'premium'], description: 'Export PPTX' },
  { policyType: 'feature_gate', policyKey: 'export_xlsx', licenseTypes: ['standard', 'premium'], description: 'Export XLSX' },
  // Research features
  { policyType: 'feature_gate', policyKey: 'literature_search', licenseTypes: ['academic', 'standard', 'premium'], description: 'Recherche bibliographique' },
  { policyType: 'feature_gate', policyKey: 'journal_finder', licenseTypes: ['academic', 'standard', 'premium'], description: 'Trouveur de revues' },
  { policyType: 'feature_gate', policyKey: 'harper_lint', licenseTypes: ['academic', 'standard', 'premium'], description: 'Vérificateur grammatical Harper' },
  { policyType: 'feature_gate', policyKey: 'cloud_backup', licenseTypes: ['standard', 'premium'], description: 'Sauvegarde cloud' },
  { policyType: 'feature_gate', policyKey: 'mendeley_sync', licenseTypes: ['standard', 'premium'], description: 'Synchronisation Mendeley' },
  // Admin
  { policyType: 'feature_gate', policyKey: 'admin_panel', licenseTypes: ['premium'], description: 'Panneau d\'administration' },
  // Roles
  { policyType: 'role', policyKey: 'admin', licenseTypes: ['premium'], description: 'Rôle administrateur' },
  { policyType: 'role', policyKey: 'researcher', licenseTypes: ['academic', 'standard', 'premium'], description: 'Rôle chercheur' },
  { policyType: 'role', policyKey: 'trial_user', licenseTypes: ['trial'], description: 'Rôle utilisateur d\'essai' },
]