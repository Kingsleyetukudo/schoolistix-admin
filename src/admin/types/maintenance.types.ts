export interface MaintenanceSchedule extends Record<string, unknown> {
  id: string
  startsAt: string
  endsAt: string
  reason: string
  status: 'scheduled' | 'active' | 'completed'
}
