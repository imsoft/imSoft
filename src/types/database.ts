export interface Service {
  id: string
  title_es?: string
  title_en?: string
  title?: string
  description_es?: string
  description_en?: string
  description?: string
  slug?: string
  image_url?: string
  icon?: string
  benefits_es?: string[]
  benefits_en?: string[]
  created_at?: string
  updated_at?: string
}

export interface QuotationQuestion {
  id: string
  service_id: string
  question_es: string
  question_en: string
  question_type: 'multiple_choice' | 'multiple_selection' | 'number' | 'yes_no' | 'range'
  options?: QuotationOption[]
  base_price: number
  price_multiplier: number
  is_required: boolean
  order_index: number
  created_at?: string
  updated_at?: string
}

export interface QuotationOption {
  label_es: string
  label_en: string
  price: number
}

export interface Quotation {
  id: string
  user_id: string
  service_id?: string
  deal_id?: string
  title?: string
  description?: string
  client_name?: string
  client_email?: string
  client_phone?: string
  client_company?: string
  answers: Record<string, any>
  subtotal: number
  iva: number
  total: number
  status: 'pending' | 'approved' | 'rejected' | 'converted'
  notes?: string
  valid_until?: string
  final_price?: number
  estimated_development_time?: number
  ai_recommendation?: {
    recommended_price?: number
    recommended_time_days?: number
    reasoning?: string
    analysis?: string
  }
  created_at?: string
  updated_at?: string
}

export interface PortfolioItem {
  id: string
  title_es?: string
  title_en?: string
  title?: string
  description_es?: string
  description_en?: string
  description?: string
  slug?: string
  image_url?: string
  project_url?: string
  client?: string
  project_type?: string
  created_at?: string
}

export interface BlogPost {
  id: string
  title_es?: string
  title_en?: string
  title?: string
  content_es?: string
  content_en?: string
  content?: string
  excerpt_es?: string
  excerpt_en?: string
  excerpt?: string
  slug?: string
  image_url?: string
  category?: string
  published: boolean
  author_id?: string
  created_at?: string
}

export interface Testimonial {
  id: string
  company?: string // Mantener para compatibilidad
  company_id?: string // Nueva relación con empresas
  content_es?: string
  content_en?: string
  content?: string
  avatar_url?: string
  created_at?: string
}

export interface ContactData {
  id: string
  address?: string
  phone?: string
  email?: string
  description?: string
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  youtube?: string
  tiktok?: string
  twitch?: string
  whatsapp?: string
  spotify?: string
  threads?: string
  facebook_visible?: boolean
  twitter_visible?: boolean
  instagram_visible?: boolean
  linkedin_visible?: boolean
  youtube_visible?: boolean
  tiktok_visible?: boolean
  twitch_visible?: boolean
  whatsapp_visible?: boolean
  spotify_visible?: boolean
  threads_visible?: boolean
  created_at?: string
}

export interface UserProfile {
  id: string
  user_id: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export interface Company {
  id: string
  name: string
  user_id: string
  logo_url?: string
  created_at?: string
  updated_at?: string
}

export interface Project {
  id: string
  title_es?: string
  title_en?: string
  title?: string
  description_es?: string
  description_en?: string
  description?: string
  slug?: string
  image_url?: string
  project_url?: string
  resources_url?: string
  client?: string // Mantener para compatibilidad
  company_id?: string // Nueva relación con empresas
  project_type?: string
  status?: string
  start_date?: string
  end_date?: string
  total_price?: number
  currency?: string
  stripe_payment_link_id?: string
  stripe_payment_link_url?: string
  stripe_enable_installments?: boolean
  stripe_installment_options?: string
  github_repo_url?: string
  github_owner?: string
  github_repo_name?: string
  github_enabled?: boolean
  created_at?: string
  updated_at?: string
}

export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'check' | 'other'
export type PaymentStatus = 'pending' | 'completed' | 'cancelled'

export interface ProjectPayment {
  id: string
  project_id: string
  amount: number
  currency?: string
  payment_method?: PaymentMethod
  payment_date?: string
  notes?: string
  status: PaymentStatus
  created_at?: string
  updated_at?: string
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface ProjectTask {
  id: string
  project_id: string
  title: string
  description?: string
  completed: boolean
  order_index: number
  priority?: TaskPriority
  category?: string
  created_at?: string
  updated_at?: string
  completed_at?: string
}

// CRM System Interfaces

export type ContactType = 'lead' | 'prospect' | 'customer' | 'partner'
export type ContactStatus = 'no_contact' | 'qualification' | 'negotiation' | 'closed_won' | 'closed_lost'
export type DealStage = 'no_contact' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task'
export type ActivityStatus = 'completed' | 'scheduled' | 'cancelled'
export type ActivityOutcome = 'successful' | 'unsuccessful' | 'no_answer' | 'rescheduled'

export interface Contact {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  job_title?: string
  contact_type: ContactType
  status: ContactStatus
  source?: string
  tags?: string[]
  address_street?: string
  address_city?: string
  address_state?: string
  address_country?: string
  address_postal_code?: string
  linkedin_url?: string
  website_url?: string
  notes?: string
  assigned_to?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface Deal {
  id: string
  contact_id?: string
  service_id?: string
  quotation_id?: string
  title: string
  description?: string
  value: number
  currency: string
  stage: DealStage
  probability?: number
  email_sent?: boolean
  expected_close_date?: string
  actual_close_date?: string
  lost_reason?: string
  tags?: string[]
  assigned_to?: string
  created_by?: string
  created_at?: string
  updated_at?: string
  contacts?: Contact
  services?: Service
  quotations?: Quotation
}

export interface Activity {
  id: string
  contact_id?: string
  deal_id?: string
  activity_type: ActivityType
  subject: string
  description?: string
  status: ActivityStatus
  scheduled_at?: string
  completed_at?: string
  duration_minutes?: number
  outcome?: ActivityOutcome
  next_action?: string
  created_by?: string
  created_at?: string
  updated_at?: string
  contacts?: Contact
  deals?: Deal
}

export interface DealStageConfig {
  id: string
  name_es: string
  name_en: string
  slug: string
  color: string
  order_index: number
  is_closed: boolean
  created_at?: string
  updated_at?: string
}

export interface ContactCustomField {
  id: string
  contact_id: string
  field_name: string
  field_value?: string
  created_at?: string
  updated_at?: string
}

export interface Feedback {
  id: string
  user_id: string
  title: string
  description: string
  status: 'pending' | 'reviewed' | 'in-progress' | 'completed' | 'rejected'
  admin_notes?: string
  created_at?: string
  updated_at?: string
}

export interface ContactMessage {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  message: string
  status: 'unread' | 'read' | 'replied' | 'archived'
  created_at?: string
  updated_at?: string
}

