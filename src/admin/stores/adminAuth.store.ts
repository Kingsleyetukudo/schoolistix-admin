import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AdminLoginPayload, AdminSession, AdminUser } from '@admin/types/admin.types'
import { ADMIN_ROLE_LABELS, ADMIN_SESSION_KEY } from '@admin/utils/constants'
import { adminApi } from '@admin/services/adminApi'

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

export const useAdminAuthStore = defineStore('adminAuth', () => {
  const session = ref<AdminSession | null>(null)
  const isLoading = ref(false)
  const error = ref('')
  const pendingChallenge = ref<{ token: string; mode: 'verify' | 'setup' } | null>(null)
  const mfaSetup = ref<{ secret: string; otpauthUrl: string } | null>(null)

  const user = computed<AdminUser | null>(() => session.value?.user ?? null)
  const isAuthenticated = computed(() => Boolean(session.value?.accessToken && session.value?.user))

  const hydrate = () => {
    if (!session.value) {
      session.value = readSession()
    }
  }

  const acceptSession = (payload: { accessToken?: string; admin?: AdminUser }) => {
    if (!payload.accessToken || !payload.admin) throw new Error('Invalid admin response from server.')
    const nextSession: AdminSession = {
      accessToken: payload.accessToken,
      user: payload.admin,
      authMode: 'backend',
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    }
    pendingChallenge.value = null
    mfaSetup.value = null
    session.value = nextSession
    persistSession(nextSession)
    return nextSession
  }

  const login = async ({ email, password }: AdminLoginPayload) => {
    isLoading.value = true
    error.value = ''

    try {
      const response = await adminApi.post('/login', { email, password })
      const payload = response.data as { accessToken?: string; admin?: AdminUser; mfaRequired?: boolean; mfaSetupRequired?: boolean; challengeToken?: string; setupToken?: string }
      const challengeToken = payload.challengeToken || payload.setupToken
      if (challengeToken && (payload.mfaRequired || payload.mfaSetupRequired)) {
        pendingChallenge.value = { token: challengeToken, mode: payload.mfaSetupRequired ? 'setup' : 'verify' }
        if (payload.mfaSetupRequired) {
          const setupResponse = await adminApi.post('/login/mfa/setup', { challengeToken })
          mfaSetup.value = setupResponse.data as { secret: string; otpauthUrl: string }
        }
        return { mfaRequired: Boolean(payload.mfaRequired), mfaSetupRequired: Boolean(payload.mfaSetupRequired) }
      }
      return acceptSession(payload)
    } catch (loginError) {
      error.value = loginError instanceof Error ? loginError.message : 'Unable to sign in.'
      throw loginError
    } finally {
      isLoading.value = false
    }
  }

  const verifyMfa = async (code: string) => {
    if (!pendingChallenge.value) throw new Error('Your sign-in challenge expired. Please sign in again.')
    isLoading.value = true
    error.value = ''
    try {
      const isSetup = pendingChallenge.value.mode === 'setup'
      const response = await adminApi.post(isSetup ? '/login/mfa/setup/verify' : '/login/mfa/verify', {
        challengeToken: pendingChallenge.value.token,
        code,
        ...(isSetup && mfaSetup.value ? { secret: mfaSetup.value.secret } : {}),
      })
      return acceptSession(response.data as { accessToken?: string; admin?: AdminUser })
    } catch (verifyError) {
      error.value = verifyError instanceof Error ? verifyError.message : 'Unable to verify MFA code.'
      throw verifyError
    } finally {
      isLoading.value = false
    }
  }

  const clearChallenge = () => { pendingChallenge.value = null; mfaSetup.value = null }

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
    pendingChallenge,
    mfaSetup,
    roleLabel: computed(() => (user.value ? ADMIN_ROLE_LABELS[user.value.role] : '')),
    hydrate,
    login,
    verifyMfa,
    clearChallenge,
    logout,
    hasRole,
  }
})
