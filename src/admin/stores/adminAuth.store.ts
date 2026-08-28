import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import type { AdminLoginPayload, AdminSession, AdminUser } from '@admin/types/admin.types'
import { ADMIN_ROLE_LABELS, ADMIN_SESSION_KEY } from '@admin/utils/constants'
import { adminApi } from '@admin/services/adminApi'
import { sampleAdminUsers } from '@admin/services/sampleData'

const persistSession = (session: AdminSession | null) => {
  if (typeof window === 'undefined') return
  if (!session) {
    window.localStorage.removeItem(ADMIN_SESSION_KEY)
    return
  }
  window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
}

const readSession = (): AdminSession | null => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(ADMIN_SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AdminSession
  } catch {
    return null
  }
}

const isBackendUnreachable = (error: unknown) =>
  axios.isAxiosError(error) && !error.response

const buildPreviewSession = (user: AdminUser): AdminSession => ({
  accessToken: `preview-${user.id}`,
  user,
  authMode: 'preview',
  expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
})

export const useAdminAuthStore = defineStore('adminAuth', () => {
  const session = ref<AdminSession | null>(null)
  const isLoading = ref(false)
  const error = ref('')

  const user = computed<AdminUser | null>(() => session.value?.user ?? null)
  const isAuthenticated = computed(() => Boolean(session.value?.accessToken && session.value?.user))

  const hydrate = () => {
    if (!session.value) {
      session.value = readSession()
    }
  }

  const login = async ({ email, password }: AdminLoginPayload) => {
    isLoading.value = true
    error.value = ''

    try {
      try {
        const response = await adminApi.post('/login', { email, password })
        const payload = response.data as { accessToken?: string; admin?: AdminUser }
        if (!payload.accessToken || !payload.admin) {
          throw new Error('Invalid admin response from server.')
        }

        const nextSession: AdminSession = {
          accessToken: payload.accessToken,
          user: payload.admin,
          authMode: 'backend',
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        }

        session.value = nextSession
        persistSession(nextSession)
        return nextSession
      } catch (apiError) {
        if (!isBackendUnreachable(apiError)) throw apiError

        const foundUser = sampleAdminUsers.find(
          (item: AdminUser) => item.email.toLowerCase() === email.trim().toLowerCase(),
        )
        if (!foundUser || !password.trim()) {
          throw new Error('Invalid admin credentials.')
        }

        const nextSession = buildPreviewSession(foundUser)
        session.value = nextSession
        persistSession(nextSession)
        return nextSession
      }
    } catch (loginError) {
      error.value = loginError instanceof Error ? loginError.message : 'Unable to sign in.'
      throw loginError
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    session.value = null
    persistSession(null)
  }

  const hasRole = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true
    return roles.includes(user.value?.role ?? '')
  }

  return {
    session,
    user,
    isLoading,
    isAuthenticated,
    error,
    roleLabel: computed(() => (user.value ? ADMIN_ROLE_LABELS[user.value.role] : '')),
    hydrate,
    login,
    logout,
    hasRole,
  }
})