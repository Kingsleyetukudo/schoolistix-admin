export type AdminRole =
  | 'super_admin'
  | 'billing_admin'
  | 'support_admin'
  | 'technical_admin'
  | 'auditor'

export interface AdminUser extends Record<string, unknown> {
  id: string
  name: string
  email: string
  role: AdminRole
  avatarUrl?: string | null
  lastLoginAt?: string | null
}

export interface AdminSession extends Record<string, unknown> {
  accessToken: string
  user: AdminUser
  expiresAt?: string | null
  authMode?: 'backend' | 'preview'
}

export interface AdminLoginPayload {
  email: string
  password: string
}
