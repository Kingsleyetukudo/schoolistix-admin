export interface School extends Record<string, unknown> {
  id: string
  name: string
  subdomain: string
  plan: string
  status: 'active' | 'trial' | 'suspended' | 'past_due'
  students: number
  staff: number
  storageGb: number
  storage_used_bytes?: number
  storage_used_mb?: number
  storage_readable?: string
  storage_limit_bytes?: number
  storage_limit_readable?: string
  storage_used_percent?: number
  counts?: Record<string, unknown>
  createdAt: string
}

export interface SchoolFilters {
  page: number
  limit: number
  status: string | null
  plan: string | null
  search: string
}

export interface SchoolStats {
  totalSchools: number
  activeSchools: number
  trialSchools: number
  suspendedSchools: number
}
