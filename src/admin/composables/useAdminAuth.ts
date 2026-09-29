import { storeToRefs } from 'pinia'
import { useAdminAuthStore } from '@admin/stores/adminAuth.store'

export function useAdminAuth() {
  const store = useAdminAuthStore()
  const { user, isAuthenticated, isLoading, error, roleLabel, pendingChallenge, mfaSetup } = storeToRefs(store)

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    roleLabel,
    pendingChallenge,
    mfaSetup,
    login: store.login,
    verifyMfa: store.verifyMfa,
    clearChallenge: store.clearChallenge,
    logout: store.logout,
    hasRole: store.hasRole,
    hydrate: store.hydrate,
  }
}
