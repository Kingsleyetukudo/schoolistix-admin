import type { Component } from 'vue'
import {
  Activity,
  ChartColumn,
  ClipboardList,
  CreditCard,
  DatabaseBackup,
  Flag,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  School,
  Settings,
  Users,
  WalletCards,
  Wrench,
} from 'lucide-vue-next'

export const adminNavIcons = {
  dashboard: LayoutDashboard,
  schools: School,
  subscriptions: WalletCards,
  payments: CreditCard,
  support: LifeBuoy,
  announcements: Megaphone,
  users: Users,
  audit: ClipboardList,
  health: Activity,
  features: Flag,
  maintenance: Wrench,
  backups: DatabaseBackup,
  reports: ChartColumn,
  settings: Settings,
} satisfies Record<string, Component>

export type AdminNavIcon = keyof typeof adminNavIcons
