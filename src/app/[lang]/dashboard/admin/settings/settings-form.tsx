'use client'

import { useTheme } from 'next-themes'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Moon, Sun, Monitor, Globe } from 'lucide-react'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'

interface SettingsFormProps {
  dict: Dictionary
  lang: Locale
}

export function SettingsForm({ dict, lang }: SettingsFormProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLanguageChange = (newLang: Locale) => {
    const segments = pathname.split('/')
    segments[1] = newLang
    const newPath = segments.join('/')
    router.push(newPath)
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
  }

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {lang === 'en' ? 'Language' : 'Idioma'}
            </CardTitle>
            <CardDescription>
              {lang === 'en' ? 'Select your preferred language' : 'Selecciona tu idioma preferido'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              {lang === 'en' ? 'Theme' : 'Tema'}
            </CardTitle>
            <CardDescription>
              {lang === 'en' ? 'Choose your preferred theme' : 'Elige tu tema preferido'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {lang === 'en' ? 'Language' : 'Idioma'}
          </CardTitle>
          <CardDescription>
            {lang === 'en' ? 'Select your preferred language' : 'Selecciona tu idioma preferido'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="language">
              {lang === 'en' ? 'Language' : 'Idioma'}
            </Label>
            <Select value={lang} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language" className="w-full !border-2 !border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)]">
                <SelectItem value="es">
                  <div className="flex items-center gap-2">
                    <span>🇲🇽</span>
                    <span>Español</span>
                  </div>
                </SelectItem>
                <SelectItem value="en">
                  <div className="flex items-center gap-2">
                    <span>🇺🇸</span>
                    <span>English</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            {lang === 'en' ? 'Theme' : 'Tema'}
          </CardTitle>
          <CardDescription>
            {lang === 'en' ? 'Choose your preferred theme' : 'Elige tu tema preferido'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="theme">
              {lang === 'en' ? 'Theme' : 'Tema'}
            </Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger id="theme" className="w-full !border-2 !border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)]">
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>{dict.theme.light}</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>{dict.theme.dark}</span>
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>{dict.theme.system}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

