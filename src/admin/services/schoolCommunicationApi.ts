import { adminApi } from './adminApi'

export interface AdminSchoolMessage {
  id: string
  senderAdminId: string
  senderName: string
  recipientEmail: string | null
  recipientPhone: string | null
  subject: string | null
  body: string
  channels: string[]
  deliveryStatus: Record<string, string>
  deliveryErrors: Record<string, string>
  createdAt: string
}

export const schoolCommunicationApi = {
  async list(schoolId: string): Promise<AdminSchoolMessage[]> {
    const response = await adminApi.get(`/schools/${encodeURIComponent(schoolId)}/messages`)
    return Array.isArray(response.data?.data) ? response.data.data : []
  },

  async send(schoolId: string, payload: {
    subject: string
    body: string
    channels: string[]
  }): Promise<{ message: AdminSchoolMessage; failures: Record<string, string> }> {
    const response = await adminApi.post(`/schools/${encodeURIComponent(schoolId)}/messages`, payload)
    return response.data
  },

  async backup(schoolId: string): Promise<{ blob: Blob; fileName: string }> {
    const response = await adminApi.get(`/schools/${encodeURIComponent(schoolId)}/backup`, {
      responseType: 'blob',
    })
    const contentDisposition = String(response.headers?.['content-disposition'] ?? '')
    const fileName = contentDisposition.match(/filename="?([^";]+)"?/i)?.[1] || `schoolistix-backup-${schoolId}.json`
    return { blob: response.data as Blob, fileName }
  },
}
