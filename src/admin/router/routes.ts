import type { RouteRecordRaw } from 'vue-router'
import type { AdminRole } from '@admin/types/admin.types'
import type { AdminNavIcon } from '@admin/components/navigation/adminNavIcons'

export const ADMIN_ROUTE_PATHS = {
  dashboard: '/admin/dashboard',
  schools: '/admin/schools',
  subscriptions: '/admin/subscriptions',
  payments: '/admin/payments',
  support: '/admin/support',
  announcements: '/admin/announcements',
  users: '/admin/users',
  audit: '/admin/audit',
  health: '/admin/health',
  features: '/admin/features',
  maintenance: '/admin/maintenance',
  reports: '/admin/reports',
  settings: '/admin/settings',
} as const

const allAdminRoles: AdminRole[] = [
  'super_admin',
  'billing_admin',
  'support_admin',
  'technical_admin',
  'auditor',
]

const icon = (name: AdminNavIcon) => name

export const adminRoutes: RouteRecordRaw[] = [
  { path: '', redirect: ADMIN_ROUTE_PATHS.dashboard },
  {
    path: 'dashboard',
    name: 'AdminDashboard',
    component: () => import('@admin/views/dashboard/Dashboard.vue'),
    meta: { title: 'Dashboard', icon: icon('dashboard'), roles: allAdminRoles },
  },
  {
    path: 'schools',
    name: 'AdminSchools',
    component: () => import('@admin/views/schools/SchoolsList.vue'),
    meta: { title: 'Schools', icon: icon('schools'), roles: allAdminRoles },
  },
  {
    path: 'schools/:id',
    name: 'AdminSchoolDetail',
    component: () => import('@admin/views/schools/SchoolDetail.vue'),
    meta: { title: 'School Details', parent: 'AdminSchools', roles: allAdminRoles },
  },
  {
    path: 'subscriptions',
    name: 'AdminSubscriptions',
    component: () => import('@admin/views/subscriptions/SubscriptionsList.vue'),
    meta: { title: 'Subscriptions', icon: icon('subscriptions'), roles: ['super_admin', 'billing_admin'] },
  },
  {
    path: 'subscriptions/:id',
    name: 'AdminSubscriptionDetail',
    component: () => import('@admin/views/subscriptions/SubscriptionDetail.vue'),
    meta: { title: 'Subscription Details', parent: 'AdminSubscriptions', roles: ['super_admin', 'billing_admin'] },
  },

  {
    path: 'payments',
    name: 'AdminPayments',
    component: () => import('@admin/views/payments/PaymentsList.vue'),
    meta: { title: 'Payments', icon: icon('payments'), roles: ['super_admin', 'billing_admin'] },
  },
  {
    path: 'support',
    name: 'AdminSupport',
    component: () => import('@admin/views/support/TicketsList.vue'),
    meta: { title: 'Support', icon: icon('support'), roles: ['super_admin', 'support_admin'] },
  },
  {
    path: 'support/:id',
    name: 'AdminTicketDetail',
    component: () => import('@admin/views/support/TicketDetail.vue'),
    meta: { title: 'Ticket Detail', parent: 'AdminSupport', roles: ['super_admin', 'support_admin'] },
  },

  {
    path: 'announcements',
    name: 'AdminAnnouncements',
    component: () => import('@admin/views/announcements/AnnouncementsList.vue'),
    meta: { title: 'Announcements', icon: icon('announcements'), roles: ['super_admin'] },
  },
  {
    path: 'users',
    name: 'AdminUsers',
    component: () => import('@admin/views/users/AdminUsersList.vue'),
    meta: { title: 'Admin Users', icon: icon('users'), roles: ['super_admin'] },
  },
  {
    path: 'audit',
    name: 'AdminAudit',
    component: () => import('@admin/views/audit/AuditLogs.vue'),
    meta: { title: 'Audit Log', icon: icon('audit'), roles: ['super_admin', 'technical_admin', 'auditor'] },
  },
  {
    path: 'health',
    name: 'AdminHealth',
    component: () => import('@admin/views/health/SystemHealth.vue'),
    meta: { title: 'System Health', icon: icon('health'), roles: ['super_admin', 'technical_admin'] },
  },
  {
    path: 'features',
    name: 'AdminFeatures',
    component: () => import('@admin/views/features/FeatureFlags.vue'),
    meta: { title: 'Feature Flags', icon: icon('features'), roles: ['super_admin', 'technical_admin'] },
  },
  {
    path: 'maintenance',
    name: 'AdminMaintenance',
    component: () => import('@admin/views/maintenance/MaintenanceSettings.vue'),
    meta: { title: 'Maintenance', icon: icon('maintenance'), roles: ['super_admin', 'technical_admin'] },
  },
  {
    path: 'reports',
    name: 'AdminReports',
    component: () => import('@admin/views/reports/ReportsDashboard.vue'),
    meta: { title: 'Reports', icon: icon('reports'), roles: ['super_admin', 'billing_admin', 'auditor'] },
  },
  {
    path: 'settings',
    name: 'AdminSettings',
    component: () => import('@admin/views/settings/PlatformSettings.vue'),
    meta: { title: 'Settings', icon: icon('settings'), roles: ['super_admin'] },
  },
]

export const adminSidebarRoutes = adminRoutes.filter((route) => route.meta?.icon)
