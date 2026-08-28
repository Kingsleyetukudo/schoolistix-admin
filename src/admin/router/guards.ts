import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAdminAuthStore } from '@admin/stores/adminAuth.store'

const resolveFallback = () => ({ name: 'AdminDashboard' as const })

export function adminAuthGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAdminAuthStore()
  authStore.hydrate()

  if (!authStore.isAuthenticated) {
    next({ name: 'AdminLogin', query: { redirect: to.fullPath } })
    return
  }

  const requiredRoles = Array.isArray(to.meta?.roles) ? to.meta.roles : []
  if (requiredRoles.length > 0 && !requiredRoles.includes(authStore.user?.role ?? '')) {
    next(resolveFallback())
    return
  }

  next()
}

export function adminGuestGuard(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAdminAuthStore()
  authStore.hydrate()

  if (authStore.isAuthenticated) {
    next(resolveFallback())
    return
  }

  next()
}
