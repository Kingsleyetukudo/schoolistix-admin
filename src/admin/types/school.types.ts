export interface School extends Record<string, unknown> {
  id: string
  name: string
  subdomain: string
  plan: string
  status: 'active' | 'trial' | 'suspended' | 'past_due'
  students: number
  staff: number
  storageGb: number
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
