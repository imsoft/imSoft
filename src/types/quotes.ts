import type { PaymentOptionKey, QuoteDiscount, QuoteItem, QuotePayment, QuoteStatus, QuoteTerms } from '@/lib/quotes'

export interface Quote {
  id: string
  number: string
  status: QuoteStatus
  lang: string
  contact_id?: string | null
  company_id?: string | null
  client_name: string
  client_company?: string | null
  client_email?: string | null
  client_rfc?: string | null
  client_address?: string | null
  title: string
  intro?: string | null
  items: QuoteItem[]
  features?: string[] | null
  currency: string
  apply_iva: boolean
  discount?: QuoteDiscount | null
  payment: QuotePayment
  terms: QuoteTerms
  notes?: string | null
  valid_until: string
  token: string
  sent_at?: string | null
  accepted_at?: string | null
  accepted_name?: string | null
  accepted_ip?: string | null
  accepted_user_agent?: string | null
  /** Payment option chosen when accepting (paymentOptions). */
  accepted_payment_option?: PaymentOptionKey | null
  project_id?: string | null
  created_by?: string | null
  created_at?: string
  updated_at?: string
}

export type ContractStatus = 'draft' | 'sent' | 'signed' | 'cancelled'

export interface Contract {
  id: string
  quote_id: string
  number: string
  status: ContractStatus
  lang: string
  body_html: string
  token: string
  sent_at?: string | null
  signed_at?: string | null
  signed_name?: string | null
  signed_ip?: string | null
  signed_user_agent?: string | null
  /** PNG data URL with the client's stroke when accepting. */
  signed_signature?: string | null
  /** SHA-256 of body_html at the time of acceptance. */
  signed_hash?: string | null
  created_at?: string
  updated_at?: string
}
