import type { AdminRole } from '@admin/types/admin.types'

export const ADMIN_SESSION_KEY = 'schoolistix.admin.session'

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  billing_admin: 'Billing Admin',
  support_admin: 'Support Admin',
  technical_admin: 'Technical Admin',
  auditor: 'Auditor',
}

export const PLAN_OPTIONS = ['starter', 'growth', 'enterprise'] as const
export const STATUS_OPTIONS = ['active', 'trial', 'suspended', 'past_due'] as const

export const DASHBOARD_KPIS = [
  { key: 'schools', label: 'Schools', value: '128', trend: '+14 this month' },
  { key: 'revenue', label: 'MRR', value: '$48,200', trend: '+8.6%' },
  { key: 'tickets', label: 'Open Tickets', value: '23', trend: '5 high priority' },
  { key: 'health', label: 'System Uptime', value: '99.98%', trend: 'Healthy' },
]
