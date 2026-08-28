import { computed } from 'vue'
import { useAdminAuth } from './useAdminAuth'
import { permissionsMap } from '@admin/utils/permissions'

export function usePermissions() {
  const { user } = useAdminAuth()
  const role = computed(() => user.value?.role ?? null)

  const can = (permission: string) => {
    if (!role.value) return false
    if (role.value === 'super_admin') return true
    return (permissionsMap[permission] ?? []).includes(role.value)
  }

  return { role, can }
}
