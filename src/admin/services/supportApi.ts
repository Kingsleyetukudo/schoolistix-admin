import type { SupportTicket } from '@admin/types/support.types'
import { ADMIN_SESSION_KEY } from '@admin/utils/constants'
import { adminApi, adminApiBase, unwrapData } from './adminApi'

type SupportTicketListResponse = {
  data?: unknown[]
  pagination?: {
    total?: number
    page?: number
    per_page?: number
    limit?: number
  }
}

const readStoredAccessToken = (): string => {
  if (typeof window === 'undefined') return ''

  const raw = window.localStorage.getItem(ADMIN_SESSION_KEY)
  if (!raw) return ''

  try {
    const parsed = JSON.parse(raw) as { accessToken?: string }
    return String(parsed?.accessToken ?? '')
  } catch {
    return ''
  }
}

const toIsoString = (value: unknown): string => {
  const normalized = String(value ?? '').trim()
  return normalized || new Date().toISOString()
}

export const normalizeSupportTicket = (ticket: Record<string, unknown> = {}): SupportTicket => {
  const school = ticket.school as Record<string, unknown> | undefined
  const assignedTo = ticket.assigned_to as Record<string, unknown> | undefined
  const channel = String(ticket.channel ?? 'ticket') === 'chat' ? 'chat' : 'ticket'

  return {
    id: String(ticket.id ?? ''),
    channel,
    subject: String(ticket.subject ?? ''),
    message: String(ticket.message ?? ''),
    schoolId: String(ticket.school_id ?? ticket.schoolId ?? ''),
    schoolName: String(ticket.school_name ?? ticket.schoolName ?? school?.name ?? ''),
    status: String(ticket.status ?? 'pending_agent_response'),
    priority: String(ticket.priority ?? 'normal'),
    updatedAt: toIsoString(ticket.updated_at ?? ticket.updatedAt ?? ticket.latest_reply_at ?? ticket.latestReplyAt),
    createdAt: ticket.created_at ? String(ticket.created_at) : ticket.createdAt ? String(ticket.createdAt) : null,
    latestReplyAt: ticket.latest_reply_at ? String(ticket.latest_reply_at) : ticket.latestReplyAt ? String(ticket.latestReplyAt) : null,
    unreadForAdmin: Boolean(ticket.unread_for_admin ?? ticket.unreadForAdmin),
    assignedTo: assignedTo
      ? {
          id: String(assignedTo.id ?? ''),
          name: String(assignedTo.name ?? ''),
          email: String(assignedTo.email ?? ''),
          role: String(assignedTo.role ?? ''),
        }
      : null,
    replyCount: Number(ticket.reply_count ?? ticket.replyCount ?? 0),
  }
}

export const buildSupportStreamUrl = (token: string) =>
  `${adminApiBase}/api/admin/support/stream?access_token=${encodeURIComponent(token)}`

export const getSupportStreamAccessToken = () => readStoredAccessToken()

export const supportApi = {
  async list(channel?: string) {
    const payload = await unwrapData<SupportTicketListResponse>(
      adminApi.get('/support/tickets', {
        params: {
          ...(channel ? { channel } : {}),
          per_page: 100,
        },
      }),
    )
    const rows = Array.isArray(payload?.data)
      ? payload.data.map((ticket) => normalizeSupportTicket(ticket as Record<string, unknown>))
      : []

    return {
      data: rows,
      pagination: payload?.pagination ?? { total: rows.length, page: 1, limit: 20 },
    }
  },

  async get(id: string) {
    const payload = await unwrapData<Record<string, unknown>>(adminApi.get(`/support/tickets/${id}`))
    return normalizeSupportTicket(payload)
  },

  async getDetail(id: string) {
    const payload = await unwrapData<Record<string, unknown>>(adminApi.get(`/support/tickets/${id}`))
    return payload ?? {}
  },

  async markRead(id: string) {
    const response = await adminApi.post(`/support/tickets/${id}/read`)
    return normalizeSupportTicket(response.data)
  },

  async assign(id: string, assignedToAdminId: string) {
    const response = await adminApi.post(`/support/tickets/${id}/assign`, {
      assignedToAdminId,
    })
    return normalizeSupportTicket(response.data)
  },

  async reply(id: string, message: string, isInternal = false, status?: string) {
    const response = await adminApi.post(`/support/tickets/${id}/reply`, {
      message,
      isInternal,
      status,
    })
    return response.data
  },
}