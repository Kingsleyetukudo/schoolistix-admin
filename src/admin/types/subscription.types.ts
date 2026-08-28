export interface Subscription extends Record<string, unknown> {
  id: string
  schoolName: string
  plan: string
  amount: number
  status: string
  renewsAt: string
}

export interface PaymentRecord extends Record<string, unknown> {
  id: string
  schoolName: string
  amount: number
  status: string
  paidAt: string
}
