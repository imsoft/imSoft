import Image from 'next/image'
import type { CSSProperties } from 'react'
import {
  ArrowUpRight, Briefcase, CalendarDays, ChevronDown, Clock, FileText, Gem, Hammer, HeartPulse, Home, KeyRound, MapPin, Paintbrush, Phone,
  Quote, Ruler, Scale, ShieldCheck, Smile, Sparkles, Star, Stethoscope, Truck, Users, UtensilsCrossed, Wrench, Zap,
} from 'lucide-react'
import { DEMO_SITES, demoWhatsAppHref, headlineParts, unsplash, type DemoIcon, type DemoSlug } from '@/lib/demo-sites'
import { DEMO_FONTS } from './fonts'
import { CountUp, FloatingBlob, Marquee, MotionRoot, ParallaxImage, Reveal, ScrollHeader, Stagger, StaggerItem } from './motion'

const ICONS: Record<DemoIcon, typeof Star> = {
  sparkles: Sparkles, smile: Smile, gem: Gem, heart: HeartPulse, shield: ShieldCheck, stethoscope: Stethoscope, utensils: UtensilsCrossed,
  truck: Truck, calendar: CalendarDays, hammer: Hammer, ruler: Ruler, home: Home, scale: Scale, briefcase: Briefcase, file: FileText,
  users: Users, wrench: Wrench, paint: Paintbrush, zap: Zap, key: KeyRound,
}

const display = '[font-family:var(--demo-display)]'
// Film grain over photos, so they read as a designed surface instead of a flat stock image.
const GRAIN = "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")]"

function Stars({ className = 'size-4' }: { className?: string }) {
  return (
    <span className="flex gap-0.5 text-[#f0b429]" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`${className} fill-current`} />)}
    </span>
  )
}

/** Accent-colored part of a headline written as "text *highlight* text". */
function Headline({ text, accentClass }: { text: string; accentClass: string }) {
  return <>{headlineParts(text).map((part, i) => (i % 2 ? <span key={i} className={accentClass}>{part}</span> : part))}</>
}

/** Small label above a section title, with a short rule before it. */
function Eyebrow({ children, className = 'text-[var(--accent)]' }: { children: string; className?: string }) {
  return (
    <p className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] ${className}`}>
      <span className="h-px w-8 bg-current" aria-hidden />{children}
    </p>
  )
}

/** Template shared by every sample site; each industry is data in src/lib/demo-sites.ts. */
export function DemoSite({ slug }: { slug: DemoSlug }) {
  const s = DEMO_SITES[slug]
  const wa = demoWhatsAppHref(slug)
  const round = s.shape === 'round'
  const loud = s.font === 'condensed'
  const r = {
    btn: round ? 'rounded-full' : 'rounded-none',
    card: round ? 'rounded-3xl' : 'rounded-none',
    img: round ? 'rounded-3xl' : 'rounded-none',
  }
  const h = `${display} ${loud ? 'uppercase tracking-tight' : 'tracking-tight'} ${s.font === 'grotesk' ? 'font-extrabold' : ''}`
  const nav = 'servicesNav' in s && s.servicesNav ? s.servicesNav : 'Servicios'
  const vars = {
    '--bg': s.colors.bg, '--fg': s.colors.fg, '--accent': s.colors.accent, '--accent-fg': s.colors.accentFg,
    '--hero-accent': 'heroAccent' in s.colors && s.colors.heroAccent ? s.colors.heroAccent : s.colors.accent,
    '--band': s.colors.band, '--band-fg': s.colors.bandFg, '--soft': s.colors.soft,
  } as CSSProperties
  const ext = { target: '_blank', rel: 'noopener noreferrer' } as const
  const primaryBtn = `group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden ${r.btn} bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-fg)] shadow-[0_12px_30px_-12px_var(--accent)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_var(--accent)] sm:px-7`
  const shine = <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/30 transition-all duration-700 group-hover/btn:left-[130%]" aria-hidden />

  return (
    <MotionRoot>
      <div style={vars} className={`${DEMO_FONTS[s.font]} min-h-screen overflow-x-clip bg-[var(--bg)] text-[var(--fg)] antialiased [font-family:var(--demo-body)] selection:bg-[var(--accent)] selection:text-[var(--accent-fg)]`}>
        {/* Ribbon */}
        <div className="relative z-50 bg-[#0b1220] text-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-0.5 px-4 py-2 text-center text-xs leading-snug sm:text-[13px]">
            <span className="opacity-80">Página de ejemplo para un negocio ficticio, hecha por imSoft.</span>
            <a href={wa} {...ext} className="font-semibold text-[#5cc8ff] underline-offset-4 hover:underline">Quiero una así para mi negocio →</a>
          </div>
        </div>

        {/* Header */}
        <ScrollHeader className="border-b border-current/10 bg-[var(--bg)]/80 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 transition-[padding] duration-300 sm:px-6 sm:py-4 group-data-[scrolled=true]/header:sm:py-2.5">
            <a href="#inicio" className="flex min-w-0 items-baseline gap-2">
              <span className={`truncate text-xl sm:text-2xl ${h}`}>{s.name}</span>
              <span className="hidden text-[11px] uppercase tracking-[0.2em] text-[var(--accent)] lg:inline">{s.tagline}</span>
            </a>
            <div className="hidden items-center gap-1 text-sm font-medium md:flex">
              {[[nav, '#servicios'], ['Nosotros', '#nosotros'], ['Opiniones', '#opiniones'], ['Ubicación', '#ubicacion']].map(([label, href]) => (
                <a key={href} href={href} className={`px-3.5 py-2 transition hover:bg-current/5 hover:text-[var(--accent)] ${r.btn}`}>{label}</a>
              ))}
            </div>
            <a href={wa} {...ext} className={`shrink-0 ${r.btn} bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-fg)] transition hover:brightness-110 sm:px-5 sm:py-2.5`}>
              {s.ctaShort}
            </a>
          </nav>
        </ScrollHeader>

        <main id="inicio">
          {/* Hero */}
          {s.hero === 'split' ? (
            <section className="relative">
              <FloatingBlob className="-left-24 top-10 size-72 bg-[var(--accent)]/15 sm:size-96" />
              <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[1.05fr_1fr] md:pb-24 md:pt-20">
                <Stagger onMount gap={0.12}>
                  <StaggerItem>
                    <p className={`mb-6 inline-flex items-center gap-2 border border-[var(--accent)]/40 bg-[var(--accent)]/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] ${r.btn}`}>
                      <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--accent)] opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-[var(--accent)]" /></span>
                      {s.eyebrow}
                    </p>
                  </StaggerItem>
                  <StaggerItem><h1 className={`text-[2.5rem] leading-[1.04] sm:text-6xl lg:text-[4.25rem] ${h}`}><Headline text={s.headline} accentClass="text-[var(--accent)]" /></h1></StaggerItem>
                  <StaggerItem><p className="mt-6 max-w-md text-base leading-relaxed opacity-75 sm:text-lg">{s.lead}</p></StaggerItem>
                  <StaggerItem>
                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                      <a href={wa} {...ext} className={primaryBtn}>{shine}{s.cta}<ArrowUpRight className="size-4 transition group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" /></a>
                      <a href="#servicios" className="text-sm font-semibold underline decoration-[var(--accent)] decoration-2 underline-offset-8 transition hover:decoration-4">Ver {nav.toLowerCase()}</a>
                    </div>
                  </StaggerItem>
                  <StaggerItem>
                    <ul className="mt-10 flex flex-wrap gap-2">
                      {s.services.slice(0, 3).map((sv) => (
                        <li key={sv.name} className={`border border-current/15 px-3 py-1 text-xs opacity-80 ${r.btn}`}>{sv.name}</li>
                      ))}
                    </ul>
                  </StaggerItem>
                </Stagger>
                <Reveal delay={0.25} y={40} className="relative">
                  <div className={`absolute -inset-3 -z-10 border-2 border-[var(--accent)]/30 ${round ? 'rounded-[2.8rem] rounded-tl-[6.5rem]' : 'translate-x-4 translate-y-4'}`} aria-hidden />
                  <div className={`group overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)] ${round ? 'rounded-[2.5rem] rounded-tl-[6rem]' : ''}`}>
                    <Image src={unsplash(s.heroImage, 1100)} alt={s.heroAlt} width={1100} height={1300} priority className="aspect-[4/5] max-h-[70vh] w-full object-cover transition duration-[1.5s] ease-out group-hover:scale-105 md:max-h-none" />
                  </div>
                  <div className={`absolute -bottom-5 left-4 border border-white/60 bg-white/85 px-5 py-3.5 text-[#1b1b1b] shadow-xl backdrop-blur-md md:-left-8 ${round ? 'rounded-2xl' : ''}`}>
                    <Stars />
                    <p className="mt-1 text-sm"><strong className={`text-lg ${display}`}>{s.rating}</strong> · {s.reviewCount} reseñas en Google</p>
                  </div>
                </Reveal>
              </div>
            </section>
          ) : (
            <section className="relative isolate overflow-hidden text-white">
              <ParallaxImage src={unsplash(s.heroImage, 1800)} alt={s.heroAlt} />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/60 to-black/25 md:bg-gradient-to-r md:from-black/90 md:via-black/55 md:to-black/5" aria-hidden />
              <div className={`pointer-events-none absolute inset-0 -z-10 opacity-[0.12] mix-blend-overlay ${GRAIN}`} aria-hidden />
              <Stagger onMount gap={0.12} className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 md:pb-36 md:pt-40">
                <StaggerItem><p className={`inline-block bg-[var(--accent)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent-fg)] ${r.btn}`}>{s.eyebrow}</p></StaggerItem>
                <StaggerItem>
                  <h1 className={`mt-6 max-w-3xl leading-[0.98] ${loud ? 'text-5xl sm:text-8xl' : 'text-[2.6rem] sm:text-7xl'} ${h}`}>
                    <Headline text={s.headline} accentClass="text-[var(--hero-accent)]" />
                  </h1>
                </StaggerItem>
                <StaggerItem><p className="mt-6 max-w-lg text-base text-white/85 sm:text-lg">{s.lead}</p></StaggerItem>
                <StaggerItem>
                  <div className="mt-9 flex flex-wrap gap-3 sm:gap-4">
                    <a href={wa} {...ext} className={primaryBtn}>{shine}<WhatsAppIcon className="size-5" />{s.cta}</a>
                    <a href="#servicios" className={`inline-flex items-center border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-semibold backdrop-blur-md transition hover:bg-white/20 sm:px-7 ${r.btn}`}>Ver {nav.toLowerCase()}</a>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className={`mt-12 inline-flex items-center gap-3 border border-white/15 bg-white/10 px-4 py-2.5 text-sm backdrop-blur-md ${r.btn}`}>
                    <Stars />
                    <span><strong>{s.rating}</strong> · {s.reviewCount} reseñas en Google</span>
                  </div>
                </StaggerItem>
              </Stagger>
              <a href="#servicios" aria-label="Bajar" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 animate-bounce text-white/70 md:block"><ChevronDown className="size-6" /></a>
            </section>
          )}

          {/* Marquee */}
          <div className={`bg-[var(--accent)] py-4 text-lg text-[var(--accent-fg)] sm:text-2xl ${h}`}>
            <Marquee items={s.services.map((sv) => sv.name)} />
          </div>

          {/* Services */}
          <section id="servicios" className="relative scroll-mt-20 overflow-hidden bg-[var(--band)] py-20 text-[var(--band-fg)] md:py-28">
            <FloatingBlob className="-right-32 -top-20 size-96 bg-[var(--accent)]/20" />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
              <Reveal className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <Eyebrow className="opacity-70">{nav}</Eyebrow>
                  <h2 className={`mt-4 max-w-xl text-4xl leading-tight sm:text-5xl ${h}`}><Headline text={s.servicesTitle} accentClass="opacity-60" /></h2>
                </div>
                <p className="max-w-xs opacity-70">{s.servicesLead}</p>
              </Reveal>
              <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {s.services.map((sv, i) => {
                  const Icon = 'icon' in sv && sv.icon ? ICONS[sv.icon] : null
                  return (
                    <StaggerItem key={sv.name} className={`group relative overflow-hidden border border-current/10 bg-current/[0.04] p-7 transition duration-500 hover:-translate-y-1.5 hover:border-current/25 hover:bg-current/[0.08] sm:p-8 ${r.card}`}>
                      <span className="absolute left-0 top-0 h-0.5 w-0 bg-[var(--accent)] transition-all duration-500 group-hover:w-full" aria-hidden />
                      <div className="flex items-start justify-between gap-4">
                        {Icon
                          ? <span className={`flex size-12 items-center justify-center bg-[var(--accent)] text-[var(--accent-fg)] transition duration-500 group-hover:rotate-[-8deg] group-hover:scale-110 ${round ? 'rounded-2xl' : ''}`}><Icon className="size-6" strokeWidth={1.75} /></span>
                          : <span className={`text-5xl text-transparent transition duration-500 [-webkit-text-stroke:1.5px_currentColor] group-hover:text-[var(--accent)] group-hover:[-webkit-text-stroke:0] ${display}`}>{String(i + 1).padStart(2, '0')}</span>}
                        {'price' in sv && sv.price && <span className={`text-2xl ${display}`}>{sv.price}</span>}
                      </div>
                      <h3 className={`mt-6 text-xl ${loud ? 'font-bold uppercase tracking-wide [font-family:var(--demo-body)]' : display}`}>{sv.name}</h3>
                      <p className="mt-3 text-sm leading-relaxed opacity-70">{sv.text}</p>
                    </StaggerItem>
                  )
                })}
              </Stagger>
            </div>
          </section>

          {/* About */}
          <section id="nosotros" className="mx-auto grid max-w-6xl scroll-mt-20 items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:gap-16 md:py-28">
            <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
              <Reveal y={50} className={`group overflow-hidden ${r.img}`}>
                <Image src={unsplash(s.about.images[0], 700)} alt={s.about.alts[0]} width={700} height={900} className="aspect-[3/4] w-full object-cover transition duration-[1.2s] group-hover:scale-110" />
              </Reveal>
              <Reveal y={80} delay={0.15} className={`group mt-12 overflow-hidden ${r.img}`}>
                <Image src={unsplash(s.about.images[1], 700)} alt={s.about.alts[1]} width={700} height={900} className="aspect-[3/4] w-full object-cover transition duration-[1.2s] group-hover:scale-110" />
              </Reveal>
              <div className={`absolute -bottom-4 -left-4 -z-10 size-32 bg-[var(--accent)]/15 ${round ? 'rounded-full' : ''}`} aria-hidden />
            </div>
            <Reveal delay={0.1}>
              <Eyebrow>{s.about.eyebrow}</Eyebrow>
              <h2 className={`mt-4 text-3xl leading-tight sm:text-[2.6rem] ${h}`}>{s.about.title}</h2>
              <p className="mt-6 leading-relaxed opacity-75">{s.about.text}</p>
              <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-current/15 pt-8">
                {s.about.stats.map(([n, l]) => (
                  <div key={l}>
                    <dt className={`text-2xl text-[var(--accent)] sm:text-4xl ${display} ${s.font === 'grotesk' ? 'font-extrabold' : ''}`}><CountUp value={n} /></dt>
                    <dd className="mt-1 text-xs opacity-60">{l}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </section>

          {'gallery' in s && s.gallery && (
            <Stagger className="grid grid-cols-1 gap-1 sm:grid-cols-3" gap={0.12}>
              {s.gallery.map((g) => (
                <StaggerItem key={g.id} className="group relative overflow-hidden">
                  <Image src={unsplash(g.id, 900)} alt={g.alt} width={900} height={700} className="aspect-[4/3] w-full object-cover transition duration-[1.2s] ease-out group-hover:scale-110" />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-5 opacity-0 transition duration-500 group-hover:opacity-100">
                    <span className="text-sm font-semibold text-white">{g.alt}</span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          )}

          {'steps' in s && s.steps && (
            <section className="relative overflow-hidden bg-[var(--accent)] py-20 text-[var(--accent-fg)] md:py-28">
              <div className={`pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay ${GRAIN}`} aria-hidden />
              <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal>
                  <Eyebrow className="opacity-80">Proceso</Eyebrow>
                  <h2 className={`mt-4 text-4xl sm:text-5xl ${h}`}>Así trabajamos</h2>
                </Reveal>
                <Stagger className="mt-12 grid gap-10 md:grid-cols-3" gap={0.15}>
                  {s.steps.map((st, i) => (
                    <StaggerItem key={st.title} as="li" className="relative list-none border-t-2 border-current pt-6">
                      <span className={`absolute -top-1 right-0 text-7xl leading-none text-transparent opacity-40 [-webkit-text-stroke:1.5px_currentColor] ${display}`}>{i + 1}</span>
                      <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Paso {i + 1}</span>
                      <h3 className={`mt-2 text-2xl sm:text-3xl ${h}`}>{st.title}</h3>
                      <p className="mt-3 font-medium opacity-90">{st.text}</p>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            </section>
          )}

          {/* Reviews */}
          <section id="opiniones" className="scroll-mt-20 bg-[var(--soft)] py-20 md:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <Reveal className="flex flex-col items-center text-center">
                <Eyebrow>Opiniones</Eyebrow>
                <h2 className={`mt-4 text-3xl sm:text-5xl ${h}`}>{s.reviewsTitle}</h2>
                <div className="mt-5 flex items-center gap-3 text-sm"><Stars className="size-5" /><span><strong className={`text-xl ${display}`}>{s.rating}</strong> de 5 · {s.reviewCount} reseñas</span></div>
              </Reveal>
              <Stagger className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6" gap={0.12}>
                {s.reviews.map((rv) => (
                  <StaggerItem as="figure" key={rv.name} className={`group relative bg-[var(--bg)] p-7 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.35)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_50px_-25px_rgba(0,0,0,0.35)] sm:p-8 ${r.card}`}>
                    <Quote className="absolute right-6 top-6 size-10 text-[var(--accent)] opacity-15 transition duration-500 group-hover:opacity-40" aria-hidden />
                    <Stars />
                    <blockquote className={`mt-5 text-lg leading-relaxed ${loud ? '' : display}`}>“{rv.text}”</blockquote>
                    <figcaption className="mt-6 flex items-center gap-3 text-sm">
                      <span className="flex size-9 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-[var(--accent-fg)]">{rv.name.replace(/^(Ing\.|Don|Familia|Grupo)\s+/, '').charAt(0)}</span>
                      <span><strong className="block">{rv.name}</strong><span className="opacity-60">Reseña de Google</span></span>
                    </figcaption>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </section>

          {/* Location */}
          <section id="ubicacion" className="mx-auto grid max-w-6xl scroll-mt-20 gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1fr_1.3fr] md:py-28">
            <Reveal>
              <Eyebrow>Ubicación</Eyebrow>
              <h2 className={`mt-4 text-4xl sm:text-5xl ${h}`}>Visítanos</h2>
              <ul className="mt-8 space-y-5 opacity-85">
                <li className="flex gap-3"><MapPin className="mt-0.5 size-5 shrink-0 text-[var(--accent)]" />{s.address}</li>
                <li className="flex gap-3"><Phone className="mt-0.5 size-5 shrink-0 text-[var(--accent)]" />33 0000 0000 · también por WhatsApp</li>
                <li className="flex gap-3">
                  <Clock className="mt-0.5 size-5 shrink-0 text-[var(--accent)]" />
                  <table className="text-sm"><tbody>{s.hours.map(([d, t]) => <tr key={d}><td className="pb-1 pr-6">{d}</td><td className="pb-1 font-semibold">{t}</td></tr>)}</tbody></table>
                </li>
              </ul>
              <a href={wa} {...ext} className={`mt-10 ${primaryBtn}`}>{shine}<WhatsAppIcon className="size-5" />Escríbenos por WhatsApp</a>
            </Reveal>
            <Reveal delay={0.15} className={`overflow-hidden shadow-[0_30px_60px_-30px_rgba(0,0,0,0.4)] ${r.card}`}>
              <iframe
                title="Mapa de ubicación"
                src={`https://www.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&output=embed`}
                className="h-80 w-full border-0 grayscale-[30%] md:h-full md:min-h-[26rem]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Reveal>
          </section>

          {/* Closing call to action */}
          <section className="px-4 pb-20 sm:px-6">
            <Reveal className={`relative mx-auto max-w-6xl overflow-hidden bg-[var(--band)] px-6 py-14 text-center text-[var(--band-fg)] sm:px-12 sm:py-20 ${r.card}`}>
              <FloatingBlob className="-bottom-24 left-1/4 size-80 bg-[var(--accent)]/30" />
              <div className="relative">
                <h2 className={`mx-auto max-w-2xl text-3xl leading-tight sm:text-5xl ${h}`}>{s.cta}</h2>
                <p className="mx-auto mt-4 max-w-md opacity-70">Te contestamos por WhatsApp en minutos, en horario de atención.</p>
                <a href={wa} {...ext} className={`mt-8 ${primaryBtn}`}>{shine}<WhatsAppIcon className="size-5" />{s.ctaShort} por WhatsApp</a>
              </div>
            </Reveal>
          </section>
        </main>

        <footer className="border-t border-current/10 py-10 text-center text-sm">
          <p className={`text-xl ${h}`}>{s.name}</p>
          <p className="mt-2 opacity-60">Negocio ficticio · Página de ejemplo hecha por <a href="https://www.imsoft.io/es" className="font-semibold text-[var(--accent)]">imSoft</a></p>
        </footer>

        <a href={wa} {...ext} aria-label="Escribir por WhatsApp" className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-110">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30 [animation-duration:2.5s]" aria-hidden />
          <WhatsAppIcon className="relative size-7" />
        </a>
      </div>
    </MotionRoot>
  )
}

export function WhatsAppIcon({ className = 'size-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.81 11.81 0 0 0 12.05 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41" />
    </svg>
  )
}
