export interface AuditLog extends Record<string, unknown> {
  id: string
  actor: string
  action: string
  target: string
  createdAt: string
}
