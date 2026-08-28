import axios from 'axios'
import type { AdminSession } from '@admin/types/admin.types'
import { ADMIN_SESSION_KEY } from '@admin/utils/constants'

const getStoredSession = (): AdminSession | null => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(ADMIN_SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AdminSession
  } catch {
    return null
  }
}

const normalizeBaseURL = (value: string | undefined): string => {
  const resolved = String(value ?? '').trim()
  if (!resolved) return ''
  return resolved.length > 1 ? resolved.replace(/\/+$/, '') : resolved
}

const resolveApiBase = (): string => {
  const configured = normalizeBaseURL(import.meta.env.VITE_API_BASE_URL)
  if (configured) return configured

  const isBrowser = typeof window !== 'undefined'
  const isLocalHost =
    isBrowser && ['localhost', '127.0.0.1'].includes(window.location.hostname)

  return isLocalHost ? 'http://localhost:7000' : ''
}

export const adminApiBase = resolveApiBase()

export const adminApi = axios.create({
  baseURL: `${adminApiBase}/api/admin`,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

adminApi.interceptors.request.use((config) => {
  const token = getStoredSession()?.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const requestUrl = String(error?.config?.url ?? '')
    const isLoginRequest = requestUrl.includes('/login')

    if (status === 401 && !isLoginRequest && typeof window !== 'undefined') {
      window.localStorage.removeItem(ADMIN_SESSION_KEY)
      if (!window.location.pathname.startsWith('/admin/login')) {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.assign(`/admin/login?redirect=${redirect}`)
      }
    }

    return Promise.reject(error)
  },
)

export const unwrapData = async <T>(promise: Promise<{ data: T }>) => {
  const response = await promise
  return response.data
}