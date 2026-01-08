'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Locale } from '@/app/[lang]/dictionaries'
import type { LanguageSwitcherProps } from '@/types/components'

export function LanguageSwitcher({ currentLang, className }: LanguageSwitcherProps) {
  const pathname = usePathname()
  const router = useRouter()

  const toggleLanguage = () => {
    // Cambiar al otro idioma
    const newLang: Locale = currentLang === 'en' ? 'es' : 'en'
    // Reemplazar el locale actual en la ruta
    const segments = pathname.split('/')
    segments[1] = newLang
    const newPath = segments.join('/')
    router.push(newPath)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className={cn('min-w-10 h-8 px-3 text-sm font-medium', className)}
      aria-label={`Cambiar idioma a ${currentLang === 'en' ? 'español' : 'inglés'}`}
    >
      {currentLang === 'en' ? 'ES' : 'EN'}
    </Button>
  )
}

