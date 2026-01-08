import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'

export interface ServiceFormProps {
  dict: Dictionary
  lang: Locale
  service?: any
}

export interface PortfolioFormProps {
  dict: Dictionary
  lang: Locale
  portfolio?: any
}

export interface BlogFormProps {
  dict: Dictionary
  lang: Locale
  post?: any
}

export interface TestimonialFormProps {
  dict: Dictionary
  lang: Locale
  testimonial?: any
}

export interface AdminContactFormProps {
  dict: Dictionary
  lang: Locale
  contactData?: any
}


