export type SupportTicketStatus =
  | 'pending_agent_response'
  | 'pending_customer_response'
  | 'in_progress'
  | 'answered'
  | 'closed'
  | 'open'
  | 'pending'
  | 'resolved'
  | string

export type SupportTicketPriority = 'low' | 'normal' | 'medium' | 'high' | 'urgent' | string

export type SupportChannel = 'ticket' | 'chat'

export interface SupportTicketAssignee {
  id: string
  name: string
  email: string
  role: string
}

export interface SupportTicket extends Record<string, unknown> {
  id: string
  channel: SupportChannel
  subject: string
  message?: string
  schoolId?: string
  schoolName: string
  status: SupportTicketStatus
  priority: SupportTicketPriority
  updatedAt: string
  createdAt?: string | null
  latestReplyAt?: string | null
  unreadForAdmin?: boolean
  assignedTo?: SupportTicketAssignee | null
  replyCount?: number
}
