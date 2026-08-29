import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  buildSupportStreamUrl,
  getSupportStreamAccessToken,
  normalizeSupportTicket,
  supportApi,
} from '@admin/services/supportApi'
import type { SupportTicket } from '@admin/types/support.types'
import {
  installSupportNotificationSound,
  playSupportNotificationSound,
} from '@admin/utils/supportNotificationSound'

const getIncomingSchoolReplyMarker = (ticket: SupportTicket | null | undefined) => {
  if (!ticket?.unreadForAdmin) return ''
  return String(ticket.latestReplyAt ?? ticket.updatedAt ?? '')
}

export const useSupportStore = defineStore('adminSupport', () => {
  const tickets = ref<SupportTicket[]>([])
  const selectedTicket = ref<SupportTicket | null>(null)
  const channel = ref<'ticket' | 'chat'>('ticket')
  const isLoading = ref(false)
  const connectionState = ref<'offline' | 'connecting' | 'live' | 'degraded' | 'preview'>('offline')
  const stream = ref<EventSource | null>(null)
  const reconnectTimer = ref<number | null>(null)

  const applyIncomingTicket = (ticket: SupportTicket | null | undefined) => {
    if (!ticket?.id) return

    const existingIndex = tickets.value.findIndex((entry) => entry.id === ticket.id)
    if (existingIndex >= 0) {
      tickets.value = tickets.value.map((entry) => (entry.id === ticket.id ? { ...entry, ...ticket } : entry))
    } else {
      tickets.value = [ticket, ...tickets.value]
    }

    tickets.value = [...tickets.value].sort(
      (left, right) =>
        new Date(String(right.updatedAt ?? right.createdAt ?? 0)).getTime() -
        new Date(String(left.updatedAt ?? left.createdAt ?? 0)).getTime(),
    )

    if (selectedTicket.value?.id === ticket.id) {
      selectedTicket.value = {
        ...selectedTicket.value,
        ...ticket,
      }
    }
  }

  const shouldPlayIncomingSchoolSound = (ticket: SupportTicket | null | undefined) => {
    if (!ticket?.id) return false

    const nextMarker = getIncomingSchoolReplyMarker(ticket)
    if (!nextMarker) return false

    const currentTicket =
      selectedTicket.value?.id === ticket.id
        ? selectedTicket.value
        : tickets.value.find((entry) => entry.id === ticket.id)

    return getIncomingSchoolReplyMarker(currentTicket) !== nextMarker
  }

  const fetchTickets = async (nextChannel?: 'ticket' | 'chat') => {
    isLoading.value = true
    try {
      if (nextChannel) {
        channel.value = nextChannel
      }
      const response = await supportApi.list()
      tickets.value = response.data
    } finally {
      isLoading.value = false
    }
  }

  const markTicketRead = async (ticketId: string) => {
    const ticket = await supportApi.markRead(ticketId)
    applyIncomingTicket(ticket)
    return ticket
  }

  const assignTicket = async (ticketId: string, assignedToAdminId: string) => {
    const ticket = await supportApi.assign(ticketId, assignedToAdminId)
    applyIncomingTicket(ticket)
    return ticket
  }

  const fetchTicket = async (id: string) => {
    selectedTicket.value = await supportApi.get(id)
  }

  const clearReconnectTimer = () => {
    if (reconnectTimer.value && typeof window !== 'undefined') {
      window.clearTimeout(reconnectTimer.value)
    }

    reconnectTimer.value = null
  }

  const scheduleReconnect = (delay = 2500) => {
    if (typeof window === 'undefined' || reconnectTimer.value) return

    reconnectTimer.value = window.setTimeout(() => {
      reconnectTimer.value = null
      if (connectionState.value === 'offline' || connectionState.value === 'preview') {
        return
      }

      connectStream()
    }, delay)
  }

  const connectStream = () => {
    installSupportNotificationSound()

    if (stream.value) {
      stream.value.close()
      stream.value = null
    }

    clearReconnectTimer()

    const token = getSupportStreamAccessToken()
    if (!token || typeof window === 'undefined') {
      connectionState.value = 'offline'
      return
    }

    if (token.startsWith('preview-')) {
      connectionState.value = 'preview'
      return
    }

    const source = new EventSource(buildSupportStreamUrl(token))
    stream.value = source
    connectionState.value = 'connecting'

    source.addEventListener('support.ready', () => {
      connectionState.value = 'live'
      clearReconnectTimer()
    })

    source.addEventListener('support.ticket.created', (event) => {
      const payload = JSON.parse(event.data || '{}') as { ticket?: Record<string, unknown> }
      const ticket = normalizeSupportTicket(payload.ticket ?? {})
      const shouldPlaySound = !tickets.value.some((entry) => entry.id === ticket.id)
      applyIncomingTicket(ticket)

      if (shouldPlaySound) {
        void playSupportNotificationSound()
      }
    })

    source.addEventListener('support.ticket.updated', (event) => {
      const payload = JSON.parse(event.data || '{}') as { ticket?: Record<string, unknown> }
      const ticket = normalizeSupportTicket(payload.ticket ?? {})
      const shouldPlaySound = shouldPlayIncomingSchoolSound(ticket)
      applyIncomingTicket(ticket)

      if (shouldPlaySound) {
        void playSupportNotificationSound()
      }
    })

    source.onerror = () => {
      if (stream.value !== source) return

      source.close()
      stream.value = null
      connectionState.value = 'degraded'
      scheduleReconnect()
    }
  }

  const disconnectStream = () => {
    clearReconnectTimer()

    if (stream.value) {
      stream.value.close()
      stream.value = null
    }

    connectionState.value = 'offline'
  }

  return {
    tickets,
    selectedTicket,
    channel,
    isLoading,
    connectionState,
    fetchTickets,
    fetchTicket,
    markTicketRead,
    assignTicket,
    connectStream,
    disconnectStream,
    applyIncomingTicket,
  }
})
