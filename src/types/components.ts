import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { ContactData } from '@/types/database'

export interface HeroSectionProps {
  dict: Dictionary
  lang: Locale
  companies?: Array<{
    id: string
    name: string
    logo_url: string
  }>
  portfolioProjects?: Array<{
    id: string
    title: string
    description: string
    image: string
  }>
  blogTitles?: Array<{
    id: string
    title: string
    slug: string
  }>
}

export interface HeroHeaderProps {
  dict: Dictionary
  lang: Locale
}

export interface FooterSectionProps {
  dict: Dictionary
  lang: Locale
  contactData?: ContactData
}

export interface ServicesSectionProps {
  dict: Dictionary
  lang: Locale
}

export interface PortfolioSectionProps {
  dict: Dictionary
  lang: Locale
  projects?: Array<{
    id: string
    title: string
    description: string
    image: string
    project_url?: string
  }>
}

export interface TestimonialsSectionProps {
  dict: Dictionary
  lang: Locale
  testimonials?: Array<{
    id: string
    company?: string
    company_id?: string
    company_logo_url?: string
    content_es?: string
    content_en?: string
    content?: string
  }>
}

export interface ModeToggleProps {
  dict: Dictionary
}

export interface LanguageSwitcherProps {
  currentLang: Locale
  className?: string
}

export interface ContactFormProps {
  dict: Dictionary
}

