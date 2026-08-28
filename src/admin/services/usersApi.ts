import { adminApi } from './adminApi'

const normalizeUser = (user: Record<string, unknown>) => ({
  id: user.id,
  name:
    String(user.name ?? '') ||
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim(),
  email: user.email,
  role: user.role,
  status: user.status ?? 'active',
  lastLoginAt: user.lastLoginAt ?? null,
  createdAt: user.createdAt ?? null,
})

export const usersApi = {
  async list() {
    const response = await adminApi.get('/users')
    const users = Array.isArray(response.data) ? response.data : []
    return users.map((user: Record<string, unknown>) => normalizeUser(user))
  },
  async invite(payload: { firstName: string; lastName: string; email: string; role: string }) {
    const response = await adminApi.post('/users/invite', payload)
    return response.data
  },
  async remove(id: string) {
    const response = await adminApi.delete(`/users/${id}`)
    return response.data
  },
}