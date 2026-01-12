'use client'

import Link from 'next/link'
import type { Locale } from '@/app/[lang]/dictionaries'
import Magnet from '@/components/ui/magnet'
import { Logo } from '@/components/blocks/hero-section'
import type { ContactData } from '@/types/database'
import { useCookieStore } from '@/stores/cookie-store'

import type { FooterSectionProps } from '@/types/components'

// Iconos para redes sociales
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path
      fillRule="evenodd"
      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
      clipRule="evenodd"
    />
  </svg>
)

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path
      fillRule="evenodd"
      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
      clipRule="evenodd"
    />
  </svg>
)

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
  </svg>
)

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const YouTubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path
      fillRule="evenodd"
      d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
      clipRule="evenodd"
    />
  </svg>
)

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

const TwitchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
  </svg>
)

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
)

const SpotifyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.56.3z" />
  </svg>
)

const ThreadsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M12.186 0C7.91 0 3.883 1.57.9 4.56a.5.5 0 0 0 0 .71l.7.7a.5.5 0 0 0 .71 0c2.48-2.48 5.78-3.84 9.28-3.84s6.8 1.36 9.28 3.84a.5.5 0 0 0 .71 0l.7-.7a.5.5 0 0 0 0-.71C20.117 1.57 16.09 0 12.186 0zm0 4.5c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zm0 5.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-8.5 2.5c-1.1 0-2 .9-2 2v5.5c0 1.1.9 2 2 2h17c1.1 0 2-.9 2-2v-5.5c0-1.1-.9-2-2-2h-17zm0 1h17c.55 0 1 .45 1 1v5.5c0 .55-.45 1-1 1h-17c-.55 0-1-.45-1-1v-5.5c0-.55.45-1 1-1z" />
  </svg>
)

export function FooterSection({ dict, lang, contactData }: FooterSectionProps) {
  const { openPreferences } = useCookieStore();

  // Construir array de enlaces de redes sociales desde contactData
  // Solo incluir redes sociales que tienen URL y están marcadas como visibles
  const socialLinks = []
  
  if (contactData?.facebook && (contactData?.facebook_visible ?? true)) {
    socialLinks.push({ name: 'Facebook', href: contactData.facebook, icon: FacebookIcon })
  }
  if (contactData?.twitter && (contactData?.twitter_visible ?? true)) {
    socialLinks.push({ name: 'X (Twitter)', href: contactData.twitter, icon: TwitterIcon })
  }
  if (contactData?.instagram && (contactData?.instagram_visible ?? true)) {
    socialLinks.push({ name: 'Instagram', href: contactData.instagram, icon: InstagramIcon })
  }
  if (contactData?.linkedin && (contactData?.linkedin_visible ?? true)) {
    socialLinks.push({ name: 'LinkedIn', href: contactData.linkedin, icon: LinkedInIcon })
  }
  if (contactData?.youtube && (contactData?.youtube_visible ?? true)) {
    socialLinks.push({ name: 'YouTube', href: contactData.youtube, icon: YouTubeIcon })
  }
  if (contactData?.tiktok && (contactData?.tiktok_visible ?? true)) {
    socialLinks.push({ name: 'TikTok', href: contactData.tiktok, icon: TikTokIcon })
  }
  if (contactData?.twitch && (contactData?.twitch_visible ?? true)) {
    socialLinks.push({ name: 'Twitch', href: contactData.twitch, icon: TwitchIcon })
  }
  if (contactData?.whatsapp && (contactData?.whatsapp_visible ?? true)) {
    socialLinks.push({ name: 'WhatsApp', href: contactData.whatsapp.startsWith('http') ? contactData.whatsapp : `https://wa.me/${contactData.whatsapp.replace(/\D/g, '')}`, icon: WhatsAppIcon })
  }
  if (contactData?.spotify && (contactData?.spotify_visible ?? true)) {
    socialLinks.push({ name: 'Spotify', href: contactData.spotify, icon: SpotifyIcon })
  }
  if (contactData?.threads && (contactData?.threads_visible ?? true)) {
    socialLinks.push({ name: 'Threads', href: contactData.threads, icon: ThreadsIcon })
  }
  const navigation = {
    solutions: [
      { id: 'marketing', name: dict.footer.solutions.items.marketing, href: `/${lang}/${lang === 'es' ? 'servicios' : 'services'}/${lang === 'es' ? 'aplicaciones-web' : 'web-applications'}` },
      { id: 'analytics', name: dict.footer.solutions.items.analytics, href: `/${lang}/${lang === 'es' ? 'servicios' : 'services'}/${lang === 'es' ? 'aplicaciones-moviles' : 'mobile-applications'}` },
      { id: 'automation', name: dict.footer.solutions.items.automation, href: `/${lang}/${lang === 'es' ? 'servicios' : 'services'}/${lang === 'es' ? 'consultoria-tecnologica' : 'technology-consulting'}` },
      { id: 'commerce', name: dict.footer.solutions.items.commerce, href: `/${lang}/${lang === 'es' ? 'servicios' : 'services'}` },
      { id: 'insights', name: dict.footer.solutions.items.insights, href: `/${lang}/${lang === 'es' ? 'portafolio' : 'portfolio'}` },
    ],
    support: [
      { id: 'quote', name: dict.nav.quote, href: lang === 'es' ? `/${lang}/cotizador` : `/${lang}/quote` },
      { id: 'submitTicket', name: dict.footer.support.items.submitTicket, href: `/${lang}/contact` },
      { id: 'documentation', name: dict.footer.support.items.documentation, href: `/${lang}/blog` },
    ],
    company: [
      { id: 'about', name: dict.footer.company.items.about, href: `/${lang}` },
      { id: 'blog', name: dict.footer.company.items.blog, href: `/${lang}/blog` },
      { id: 'jobs', name: dict.footer.company.items.jobs, href: `/${lang}/contact` },
    ],
    legal: [
      { id: 'terms', name: dict.footer.legal.items.terms, href: `/${lang}/${lang === 'es' ? 'terminos-y-condiciones' : 'terms-and-conditions'}` },
      { id: 'privacy', name: dict.footer.legal.items.privacy, href: `/${lang}/${lang === 'es' ? 'aviso-de-privacidad' : 'privacy-policy'}` },
      { id: 'cookies', name: dict.footer.legal.items.cookies, href: `/${lang}/cookie-policy` },
    ],
  }

  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <hgroup>
            <h2 className="text-base/7 font-semibold text-primary">{dict.footer.cta.title}</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              {dict.footer.cta.heading}
            </p>
          </hgroup>
          <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-muted-foreground">
            {dict.footer.cta.description}
          </p>
          <div className="mt-8 flex justify-center">
            <Magnet padding={50} disabled={false} magnetStrength={10}>
              <Link
                href={`/${lang}/signup`}
                className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {dict.footer.cta.button}
              </Link>
            </Magnet>
          </div>
        </div>
        <div className="mt-24 border-t border-border pt-12 xl:grid xl:grid-cols-3 xl:gap-8">
          <Link href={`/${lang}`} className="flex items-center justify-start">
            <Logo className="h-16 w-16" />
          </Link>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm/6 font-semibold text-foreground">{dict.footer.solutions.title}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.solutions.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="text-sm/6 text-muted-foreground hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm/6 font-semibold text-foreground">{dict.footer.support.title}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.support.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="text-sm/6 text-muted-foreground hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm/6 font-semibold text-foreground">{dict.footer.company.title}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="text-sm/6 text-muted-foreground hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm/6 font-semibold text-foreground">{dict.footer.legal.title}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="text-sm/6 text-muted-foreground hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 md:flex md:items-center md:justify-between">
          {socialLinks.length > 0 && (
            <div className="flex gap-x-6 md:order-2">
              {socialLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon aria-hidden="true" className="size-6" />
                </Link>
              ))}
            </div>
          )}
          <div className="mt-8 text-sm/6 text-muted-foreground md:order-1 md:mt-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <p>
              {dict.footer.copyright.replace('{year}', new Date().getFullYear().toString())}
            </p>
            <button
              onClick={openPreferences}
              className="text-sm underline underline-offset-4 hover:text-foreground transition-colors text-left sm:text-center"
            >
              {dict.footer.cookieSettings}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

