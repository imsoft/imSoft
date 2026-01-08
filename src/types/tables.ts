import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { Service } from './database'
import type { PortfolioItem } from './database'
import type { BlogPost } from './database'
import type { Testimonial } from './database'
import type { Project } from './database'

export interface ServicesTableProps {
  services: Service[]
  dict: Dictionary
  lang: Locale
}

export interface PortfolioTableProps {
  portfolio: PortfolioItem[]
  dict: Dictionary
  lang: Locale
}

export interface BlogTableProps {
  posts: BlogPost[]
  dict: Dictionary
  lang: Locale
}

export interface TestimonialsTableProps {
  testimonials: Testimonial[]
  dict: Dictionary
  lang: Locale
}

export interface ProjectsTableProps {
  projects: Project[]
  dict: Dictionary
  lang: Locale
}

