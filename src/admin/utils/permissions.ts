import type { AdminRole } from '@admin/types/admin.types'

export const permissionsMap: Record<string, AdminRole[]> = {
  'schools.view': ['super_admin', 'billing_admin', 'support_admin', 'technical_admin', 'auditor'],
  'schools.create': ['super_admin'],
  'schools.edit': ['super_admin', 'support_admin'],
  'schools.suspend': ['super_admin', 'support_admin'],
  'schools.login_as': ['super_admin', 'support_admin'],
  'subscriptions.view': ['super_admin', 'billing_admin'],
  'subscriptions.manage': ['super_admin', 'billing_admin'],
  'payments.record': ['super_admin', 'billing_admin'],
  'payments.refund': ['super_admin', 'billing_admin'],
  'tickets.view': ['super_admin', 'support_admin'],
  'tickets.reply': ['super_admin', 'support_admin'],
  'announcements.send': ['super_admin'],
  'health.view': ['super_admin', 'technical_admin'],
  'features.manage': ['super_admin', 'technical_admin'],
  'maintenance.manage': ['super_admin', 'technical_admin'],
  'backups.manage': ['super_admin', 'technical_admin'],
  'backups.restore': ['super_admin'],
  'audit.view': ['super_admin', 'technical_admin', 'auditor'],
  'reports.view': ['super_admin', 'billing_admin', 'auditor'],
  'settings.manage': ['super_admin'],
}
