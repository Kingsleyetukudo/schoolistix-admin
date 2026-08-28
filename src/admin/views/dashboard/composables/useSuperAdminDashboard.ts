import { onMounted, ref } from 'vue'
import axios from 'axios'
import { adminApi } from '@admin/services/adminApi'
import { paymentsApi } from '@admin/services/paymentsApi'
import { featuresApi, type FeatureFlagItem } from '@admin/services/featuresApi'
import { usersApi } from '@admin/services/usersApi'
import { schoolsApi } from '@admin/services/schoolsApi'
import type { School } from '@admin/types/school.types'

export interface DashboardStats {
  total_schools: number
  active_schools: number
  trial_schools: number
  suspended_schools: number
  total_students: number
  total_teachers: number
  storage_readable: string
}

export interface DashboardCharts {
  range_days: number
  schools_added: Array<{ key: string; label: string; count: number }>
  plan_distribution: Array<{ plan: string; count: number }>
}

export type DashboardPaymentRow = Record<string, unknown>
export type DashboardUserRow = Record<string, unknown>

const emptyStats = (): DashboardStats => ({
  total_schools: 0,
  active_schools: 0,
  trial_schools: 0,
  suspended_schools: 0,
  total_students: 0,
  total_teachers: 0,
  storage_readable: '0 B',
})

const emptyCharts = (): DashboardCharts => ({
  range_days: 30,
  schools_added: [],
  plan_distribution: [],
})

const normalizeStats = (payload: unknown): DashboardStats => {
  const body = payload as Partial<DashboardStats> | null
  if (!body || typeof body !== 'object') return emptyStats()
  return {
    total_schools: Number(body.total_schools ?? 0),
    active_schools: Number(body.active_schools ?? 0),
    trial_schools: Number(body.trial_schools ?? 0),
    suspended_schools: Number(body.suspended_schools ?? 0),
    total_students: Number(body.total_students ?? 0),
    total_teachers: Number(body.total_teachers ?? 0),
    storage_readable: String(body.storage_readable ?? '0 B'),
  }
}

const normalizeCharts = (payload: unknown): DashboardCharts => {
  const body = payload as Partial<DashboardCharts> | null
  if (!body || typeof body !== 'object') return emptyCharts()
  return {
    range_days: Number(body.range_days ?? 30),
    schools_added: Array.isArray(body.schools_added) ? body.schools_added : [],
    plan_distribution: Array.isArray(body.plan_distribution) ? body.plan_distribution : [],
  }
}

const errorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.error as string | undefined
    return serverMessage || error.message
  }
  return error instanceof Error ? error.message : 'Something went wrong.'
}

export function useSuperAdminDashboard() {
  const stats = ref<DashboardStats>(emptyStats())
  const charts = ref<DashboardCharts>(emptyCharts())
  const recentSchools = ref<School[]>([])
  const pendingPayments = ref<DashboardPaymentRow[]>([])
  const features = ref<FeatureFlagItem[]>([])
  const adminUsers = ref<DashboardUserRow[]>([])
  const isRefreshing = ref(false)
  const notice = ref('')
  const noticeTone = ref<'success' | 'error'>('success')

  const showNotice = (message: string, tone: 'success' | 'error') => {
    notice.value = message
    noticeTone.value = tone
  }

  const loadAll = async () => {
    isRefreshing.value = true
    const [statsResult, chartsResult, schoolsResult, paymentsResult, featuresResult, usersResult] =
      await Promise.allSettled([
        adminApi.get('/stats'),
        adminApi.get('/stats/charts', { params: { days: 30 } }),
        schoolsApi.list({ page: 1, limit: 8 }),
        paymentsApi.list({ status: 'pending', limit: 10 }),
        featuresApi.list(),
        usersApi.list(),
      ])

    if (statsResult.status === 'fulfilled') {
      stats.value = normalizeStats(statsResult.value.data)
    } else {
      stats.value = emptyStats()
    }

    if (chartsResult.status === 'fulfilled') {
      charts.value = normalizeCharts(chartsResult.value.data)
    } else {
      charts.value = emptyCharts()
    }

    if (schoolsResult.status === 'fulfilled') {
      recentSchools.value = Array.isArray(schoolsResult.value.data)
        ? schoolsResult.value.data
        : []
    } else {
      recentSchools.value = []
    }

    if (paymentsResult.status === 'fulfilled') {
      pendingPayments.value = Array.isArray(paymentsResult.value.data)
        ? paymentsResult.value.data
        : []
    } else {
      pendingPayments.value = []
    }

    if (featuresResult.status === 'fulfilled') {
      features.value = featuresResult.value
    } else {
      features.value = []
    }

    if (usersResult.status === 'fulfilled') {
      adminUsers.value = Array.isArray(usersResult.value) ? usersResult.value : []
    } else {
      adminUsers.value = []
    }

    const failedLoads = [statsResult, chartsResult, schoolsResult, paymentsResult, featuresResult, usersResult].filter(
      (result) => result.status === 'rejected',
    ).length
    if (failedLoads > 0) {
      showNotice(
        `${failedLoads} of 6 dashboard modules could not load. Check that the backend is running.`,
        'error',
      )
    }

    isRefreshing.value = false
  }

  const approvePayment = async (payment: DashboardPaymentRow) => {
    try {
      const result = await paymentsApi.approve(String(payment.id))
      showNotice(
        result.activated
          ? `Payment approved — access activated for ${String(payment.school_name ?? 'the school')}.`
          : 'Payment approved.',
        'success',
      )
      await loadAll()
      return true
    } catch (error) {
      showNotice(errorMessage(error), 'error')
      return false
    }
  }

  const rejectPayment = async (payment: DashboardPaymentRow, reason?: string) => {
    try {
      await paymentsApi.reject(String(payment.id), reason?.trim() || undefined)
      showNotice(
        `Payment from ${String(payment.school_name ?? 'the school')} was rejected.`,
        'success',
      )
      await loadAll()
      return true
    } catch (error) {
      showNotice(errorMessage(error), 'error')
      return false
    }
  }

  const toggleFeature = async (feature: FeatureFlagItem) => {
    try {
      await featuresApi.update(feature.key, !feature.enabled)
      feature.enabled = !feature.enabled
      showNotice(`${feature.label} ${feature.enabled ? 'enabled' : 'disabled'}.`, 'success')
      return true
    } catch (error) {
      showNotice(errorMessage(error), 'error')
      return false
    }
  }

  const inviteAdmin = async (payload: {
    firstName: string
    lastName: string
    email: string
    role: string
  }) => {
    try {
      await usersApi.invite(payload)
      showNotice(`Invite sent to ${payload.email}.`, 'success')
      await loadAll()
      return true
    } catch (error) {
      showNotice(errorMessage(error), 'error')
      return false
    }
  }

  onMounted(() => {
    void loadAll()
  })

  return {
    stats,
    charts,
    recentSchools,
    pendingPayments,
    features,
    adminUsers,
    isRefreshing,
    notice,
    noticeTone,
    loadAll,
    approvePayment,
    rejectPayment,
    toggleFeature,
    inviteAdmin,
  }
}