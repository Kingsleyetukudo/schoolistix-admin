export interface BackupRecord extends Record<string, unknown> {
  id: string
  name: string
  status: 'ready' | 'running' | 'failed'
  createdAt: string
  sizeMb: number
}
