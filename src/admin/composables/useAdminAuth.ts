import { storeToRefs } from 'pinia'
import { useAdminAuthStore } from '@admin/stores/adminAuth.store'

export function useAdminAuth() {
  const store = useAdminAuthStore()
  const { user, isAuthenticated, isLoading, error, roleLabel } = storeToRefs(store)

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    roleLabel,
    login: store.login,
    logout: store.logout,
    hasRole: store.hasRole,
    hydrate: store.hydrate,
  }
}
