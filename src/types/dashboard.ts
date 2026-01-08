import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { User } from '@supabase/supabase-js'

export interface AdminSidebarProps {
  dict: Dictionary
  lang: Locale
  user: User
}

export interface ClientSidebarProps {
  dict: Dictionary
  lang: Locale
  user: User
}

