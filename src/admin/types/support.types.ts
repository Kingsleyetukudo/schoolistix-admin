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

export interface SupportTicket extends Record<string, unknown> {
  id: string
  subject: string
  schoolId?: string
  schoolName: string
  status: SupportTicketStatus
  priority: SupportTicketPriority
  updatedAt: string
  createdAt?: string | null
  latestReplyAt?: string | null
  unreadForAdmin?: boolean
  replyCount?: number
}
