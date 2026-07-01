'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SocialLink } from '@/types/database'

// Local brand SVG icons to avoid lucide-react missing export build errors
const InstagramIcon = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const TikTokIcon = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
)

const LinkedinIcon = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const FacebookIcon = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const TwitterIcon = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
)

const YoutubeIcon = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
)

const WhatsappIcon = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

const WebsiteIcon = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" x2="22" y1="12" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

interface SocialLinksEditorProps {
  value?: SocialLink[]
  onChange: (value: SocialLink[]) => void
  lang: string
}

type Platform = SocialLink['platform']

interface PlatformConfig {
  value: Platform
  label: string
  icon: React.ComponentType<{ className?: string }>
  placeholder: string
  isHandle: boolean
  domainPattern: RegExp
}

const PLATFORMS: PlatformConfig[] = [
  {
    value: 'instagram',
    label: 'Instagram',
    icon: InstagramIcon,
    placeholder: 'usuario',
    isHandle: true,
    domainPattern: /(?:instagram\.com)\/([a-zA-Z0-9_\.]+)/i,
  },
  {
    value: 'tiktok',
    label: 'TikTok',
    icon: TikTokIcon,
    placeholder: 'usuario',
    isHandle: true,
    domainPattern: /(?:tiktok\.com)\/@([a-zA-Z0-9_\.]+)/i,
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
    icon: LinkedinIcon,
    placeholder: 'https://linkedin.com/in/usuario',
    isHandle: false,
    domainPattern: /(?:linkedin\.com\/in)\/([a-zA-Z0-9_\-\%]+)/i,
  },
  {
    value: 'facebook',
    label: 'Facebook',
    icon: FacebookIcon,
    placeholder: 'https://facebook.com/usuario',
    isHandle: false,
    domainPattern: /(?:facebook\.com)\/([a-zA-Z0-9_\.]+)/i,
  },
  {
    value: 'twitter',
    label: 'X (Twitter)',
    icon: TwitterIcon,
    placeholder: 'usuario',
    isHandle: true,
    domainPattern: /(?:twitter\.com|x\.com)\/([a-zA-Z0-9_\.]+)/i,
  },
  {
    value: 'youtube',
    label: 'YouTube',
    icon: YoutubeIcon,
    placeholder: 'https://youtube.com/@canal',
    isHandle: false,
    domainPattern: /(?:youtube\.com)\/(?:@)?([a-zA-Z0-9_\-\.]+)/i,
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    icon: WhatsappIcon,
    placeholder: '521234567890',
    isHandle: false,
    domainPattern: /(?:wa\.me|api\.whatsapp\.com\/send\?phone=)\/([0-9]+)/i,
  },
  {
    value: 'website',
    label: 'Sitio Web',
    icon: WebsiteIcon,
    placeholder: 'https://ejemplo.com',
    isHandle: false,
    domainPattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i,
  },
]

export function SocialLinksEditor({ value = [], onChange, lang }: SocialLinksEditorProps) {
  const isEs = lang === 'es'
  const [links, setLinks] = useState<SocialLink[]>(value)

  useEffect(() => {
    // Sync external changes if needed, but avoid infinite loops
    if (JSON.stringify(links) !== JSON.stringify(value)) {
      setLinks(value || [])
    }
  }, [value])

  const handleLinksChange = (newLinks: SocialLink[]) => {
    setLinks(newLinks)
    onChange(newLinks)
  }

  const addLink = () => {
    // Find a platform not already added, or default to website
    const usedPlatforms = links.map((l) => l.platform)
    const nextPlatform = PLATFORMS.find((p) => !usedPlatforms.includes(p.value))?.value || 'website'
    
    const newLinks: SocialLink[] = [...links, { platform: nextPlatform, url: '' }]
    handleLinksChange(newLinks)
  }

  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index)
    handleLinksChange(newLinks)
  }

  const updateLinkPlatform = (index: number, platform: Platform) => {
    const newLinks = [...links]
    newLinks[index] = { ...newLinks[index], platform }
    handleLinksChange(newLinks)
  }

  const updateLinkUrl = (index: number, rawValue: string) => {
    let urlVal = rawValue
    let detectedPlatform: Platform | null = null

    // Try to auto-detect platform if it looks like a URL
    if (urlVal.includes('.') || urlVal.includes('/') || urlVal.startsWith('http')) {
      for (const p of PLATFORMS) {
        if (p.value === 'website') continue // Skip generic website detection until the end
        
        const match = urlVal.match(p.domainPattern)
        if (match) {
          detectedPlatform = p.value
          // For handles, extract just the handle
          if (p.isHandle && match[1]) {
            urlVal = match[1]
          }
          break
        }
      }

      // If it looks like a URL but no specific platform matched, check if it's general web
      if (!detectedPlatform && PLATFORMS.find(p => p.value === 'website')?.domainPattern.test(urlVal)) {
        detectedPlatform = 'website'
      }
    }

    // Clean up handles: strip any leading @ if the platform requires handle
    const currentPlatform = detectedPlatform || links[index].platform
    const platformConfig = PLATFORMS.find((p) => p.value === currentPlatform)
    if (platformConfig?.isHandle) {
      urlVal = urlVal.replace(/^@+/, '')
    }

    const newLinks = [...links]
    newLinks[index] = {
      platform: currentPlatform,
      url: urlVal,
    }
    handleLinksChange(newLinks)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">
          {isEs ? 'Redes Sociales y Enlaces' : 'Social Links & Web'}
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLink}
          className="h-8 gap-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          {isEs ? 'Agregar enlace' : 'Add link'}
        </Button>
      </div>

      {links.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          {isEs ? 'No se han agregado redes sociales.' : 'No social links added.'}
        </p>
      ) : (
        <div className="space-y-3">
          {links.map((link, index) => {
            const platformConfig = PLATFORMS.find((p) => p.value === link.platform) || PLATFORMS[PLATFORMS.length - 1]
            const Icon = platformConfig.icon

            return (
              <div key={index} className="flex gap-2 items-start">
                <div className="w-40 shrink-0">
                  <Select
                    value={link.platform}
                    onValueChange={(val) => updateLinkPlatform(index, val as Platform)}
                  >
                    <SelectTrigger className="w-full !border-2 !border-border h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => {
                        const PIcon = p.icon
                        return (
                          <SelectItem key={p.value} value={p.value}>
                            <div className="flex items-center gap-2">
                              <PIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span>{p.label}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 flex relative">
                  {platformConfig.isHandle && (
                    <span className="inline-flex items-center px-3 rounded-l-md border-2 border-r-0 border-border bg-muted text-muted-foreground text-sm font-medium select-none">
                      @
                    </span>
                  )}
                  <Input
                    value={link.url}
                    onChange={(e) => updateLinkUrl(index, e.target.value)}
                    placeholder={platformConfig.placeholder}
                    className={`!border-2 !border-border h-10 ${
                      platformConfig.isHandle ? 'rounded-l-none' : ''
                    }`}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLink(index)}
                  className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
