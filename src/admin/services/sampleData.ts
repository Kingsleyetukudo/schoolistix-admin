import type { AdminUser } from '@admin/types/admin.types'
import type { AuditLog } from '@admin/types/audit.types'
import type { BackupRecord } from '@admin/types/backup.types'
import type { MaintenanceSchedule } from '@admin/types/maintenance.types'
import type { School } from '@admin/types/school.types'
import type { Subscription, PaymentRecord } from '@admin/types/subscription.types'
import type { SupportTicket } from '@admin/types/support.types'

export const sampleAdminUsers: AdminUser[] = [
  { id: 'admin-1', name: 'Jane Doe', email: 'jane@schoolistix.com', role: 'super_admin', lastLoginAt: '2026-05-20T08:00:00Z' },
  { id: 'admin-2', name: 'Biola Okafor', email: 'biola@schoolistix.com', role: 'billing_admin', lastLoginAt: '2026-05-19T13:00:00Z' },
  { id: 'admin-3', name: 'John Kariuki', email: 'john@schoolistix.com', role: 'support_admin', lastLoginAt: '2026-05-19T10:40:00Z' },
  { id: 'admin-4', name: 'Sam Otieno', email: 'sam@schoolistix.com', role: 'technical_admin', lastLoginAt: '2026-05-18T16:10:00Z' },
  { id: 'admin-5', name: 'Amina Yusuf', email: 'amina@schoolistix.com', role: 'auditor', lastLoginAt: '2026-05-17T07:20:00Z' },
]

export const sampleSchools: School[] = [
  { id: 'sch-1', name: 'Greenfield College', subdomain: 'greenfield', plan: 'growth', status: 'active', students: 1240, staff: 102, storageGb: 86, createdAt: '2025-01-12T10:00:00Z' },
  { id: 'sch-2', name: 'Sunrise Academy', subdomain: 'sunrise', plan: 'starter', status: 'trial', students: 640, staff: 51, storageGb: 24, createdAt: '2025-09-18T10:00:00Z' },
  { id: 'sch-3', name: 'Everest High', subdomain: 'everest', plan: 'enterprise', status: 'past_due', students: 2340, staff: 185, storageGb: 148, createdAt: '2024-08-02T10:00:00Z' },
]

export const sampleSubscriptions: Subscription[] = [
  { id: 'sub-1', schoolName: 'Greenfield College', plan: 'growth', amount: 1200, status: 'active', renewsAt: '2026-06-01T00:00:00Z' },
  { id: 'sub-2', schoolName: 'Sunrise Academy', plan: 'starter', amount: 450, status: 'trial', renewsAt: '2026-05-28T00:00:00Z' },
  { id: 'sub-3', schoolName: 'Everest High', plan: 'enterprise', amount: 2800, status: 'past_due', renewsAt: '2026-05-25T00:00:00Z' },
]

export const samplePayments: PaymentRecord[] = [
  { id: 'pay-1', schoolName: 'Greenfield College', amount: 1200, status: 'paid', paidAt: '2026-05-01T09:00:00Z' },
  { id: 'pay-2', schoolName: 'Sunrise Academy', amount: 450, status: 'failed', paidAt: '2026-05-10T15:12:00Z' },
  { id: 'pay-3', schoolName: 'Everest High', amount: 2800, status: 'refunded', paidAt: '2026-05-03T12:15:00Z' },
]

export const sampleTickets: SupportTicket[] = [
  { id: 'tic-1', subject: 'Unable to publish results', schoolName: 'Greenfield College', status: 'open', priority: 'high', updatedAt: '2026-05-20T09:20:00Z' },
  { id: 'tic-2', subject: 'Need billing clarification', schoolName: 'Sunrise Academy', status: 'pending', priority: 'medium', updatedAt: '2026-05-19T14:00:00Z' },
  { id: 'tic-3', subject: 'Domain SSL setup', schoolName: 'Everest High', status: 'resolved', priority: 'low', updatedAt: '2026-05-18T08:30:00Z' },
]

export const sampleAuditLogs: AuditLog[] = [
  { id: 'audit-1', actor: 'Jane Doe', action: 'Suspended school', target: 'Everest High', createdAt: '2026-05-19T12:00:00Z' },
  { id: 'audit-2', actor: 'Sam Otieno', action: 'Enabled maintenance banner', target: 'Platform', createdAt: '2026-05-18T18:00:00Z' },
  { id: 'audit-3', actor: 'Amina Yusuf', action: 'Exported subscription report', target: 'Billing', createdAt: '2026-05-17T10:00:00Z' },
]

export const sampleBackups: BackupRecord[] = [
  { id: 'bak-1', name: 'nightly-2026-05-20', status: 'ready', createdAt: '2026-05-20T01:10:00Z', sizeMb: 860 },
  { id: 'bak-2', name: 'nightly-2026-05-19', status: 'ready', createdAt: '2026-05-19T01:10:00Z', sizeMb: 854 },
  { id: 'bak-3', name: 'pre-release-2026-05-18', status: 'failed', createdAt: '2026-05-18T05:10:00Z', sizeMb: 0 },
]

export const sampleMaintenanceHistory: MaintenanceSchedule[] = [
  { id: 'mnt-1', startsAt: '2026-05-30T01:00:00Z', endsAt: '2026-05-30T03:00:00Z', reason: 'Database indexing', status: 'scheduled' },
  { id: 'mnt-2', startsAt: '2026-05-10T23:00:00Z', endsAt: '2026-05-11T01:00:00Z', reason: 'Queue maintenance', status: 'completed' },
]
