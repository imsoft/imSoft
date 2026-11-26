import Image from 'next/image'
import { Fraunces, Figtree } from 'next/font/google'
import { Clock, MapPin, Phone, Star, Sparkles, ShieldCheck, Smile, HeartPulse, Gem, Stethoscope } from 'lucide-react'
import { demoWhatsAppHref, unsplash } from '@/lib/demo-sites'
import { DemoRibbon } from './demo-ribbon'

const display = Fraunces({ subsets: ['latin'], weight: ['400', '600'], style: ['normal', 'italic'], variable: '--font-dental-display' })
const body = Figtree({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-dental-body' })

const SERVICES = [
  { icon: Sparkles, name: 'Limpieza dental', text: 'Profilaxis con ultrasonido y pulido. Sales en 40 minutos con la boca como nueva.' },
  { icon: Smile, name: 'Ortodoncia invisible', text: 'Alineadores transparentes con revisión mensual y plan de pagos.' },
  { icon: Gem, name: 'Blanqueamiento', text: 'Tratamiento en consultorio con luz LED, sin sensibilidad.' },
  { icon: HeartPulse, name: 'Endodoncia', text: 'Tratamiento de conductos con anestesia controlada y sin dolor.' },
  { icon: ShieldCheck, name: 'Resinas y coronas', text: 'Restauraciones del color de tu diente, hechas para durar.' },
  { icon: Stethoscope, name: 'Implantes', text: 'Valoración con radiografía digital y presupuesto por escrito.' },
]

const REVIEWS = [
  { name: 'Mariana G.', text: 'Me daban pánico los dentistas y aquí por fin me sentí tranquila. Todo me lo explicaron antes de empezar.' },
  { name: 'Jorge R.', text: 'Agendé por WhatsApp un sábado y me atendieron a la hora. El consultorio está impecable.' },
  { name: 'Lucía P.', text: 'Llevo a mis dos hijos desde hace años. La doctora tiene una paciencia increíble con ellos.' },
]

const HOURS = [
  ['Lunes a viernes', '9:00 – 19:00'],
  ['Sábado', '9:00 – 14:00'],
  ['Domingo', 'Cerrado'],
]

export function DentalDemo() {
  const wa = demoWhatsAppHref('consultorio-dental')
  return (
    <div className={`${display.variable} ${body.variable} min-h-screen bg-[#fbf8f3] text-[#1d2b2a] [font-family:var(--font-dental-body)]`}>
      <DemoRibbon slug="consultorio-dental" />

      <header className="sticky top-0 z-40 border-b border-[#1d2b2a]/10 bg-[#fbf8f3]/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="#inicio" className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight [font-family:var(--font-dental-display)]">Dental Alba</span>
            <span className="hidden text-xs uppercase tracking-[0.2em] text-[#2f7d73] sm:inline">Odontología integral</span>
          </a>
          <div className="hidden items-center gap-8 text-sm md:flex">
            <a href="#servicios" className="hover:text-[#2f7d73]">Servicios</a>
            <a href="#nosotros" className="hover:text-[#2f7d73]">Nosotros</a>
            <a href="#opiniones" className="hover:text-[#2f7d73]">Opiniones</a>
            <a href="#ubicacion" className="hover:text-[#2f7d73]">Ubicación</a>
          </div>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#2f7d73] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#25655d]">
            Agendar cita
          </a>
        </nav>
      </header>

      <main id="inicio">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 md:grid-cols-[1.05fr_1fr] md:pt-20">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2f7d73]/30 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#2f7d73]">
              Chapultepec · Guadalajara
            </p>
            <h1 className="text-[2.6rem] leading-[1.05] tracking-tight sm:text-6xl [font-family:var(--font-dental-display)]">
              Una sonrisa sana, <em className="font-normal text-[#2f7d73]">sin prisas</em> ni sustos.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[#1d2b2a]/75">
              Consultorio familiar con más de 12 años cuidando dientes en Guadalajara. Te explicamos todo antes de empezar y el presupuesto va por escrito.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#1d2b2a] px-7 py-3.5 text-sm font-semibold text-[#fbf8f3] transition hover:bg-[#2f7d73]">
                Agenda tu valoración sin costo
              </a>
              <a href="#servicios" className="text-sm font-semibold underline decoration-[#2f7d73] decoration-2 underline-offset-8">
                Ver tratamientos
              </a>
            </div>
          </div>

          <div className="relative animate-in fade-in zoom-in-95 duration-1000">
            <div className="absolute -left-6 -top-6 hidden h-40 w-40 rounded-full bg-[#e8c9a8]/60 md:block" aria-hidden />
            <div className="relative overflow-hidden rounded-[2.5rem] rounded-tl-[6rem] shadow-[0_30px_60px_-25px_rgba(29,43,42,0.45)]">
              <Image src={unsplash('1629909613654-28e377c37b09', 1100)} alt="Consultorio dental luminoso" width={1100} height={1300} priority className="aspect-[4/5] w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 left-4 rounded-2xl bg-white px-5 py-4 shadow-xl sm:left-[-2rem]">
              <div className="flex items-center gap-1 text-[#e0a526]">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}
              </div>
              <p className="mt-1 text-sm"><strong className="text-lg [font-family:var(--font-dental-display)]">4.9</strong> · 186 reseñas en Google</p>
            </div>
          </div>
        </section>

        <section id="servicios" className="bg-[#1d2b2a] py-24 text-[#fbf8f3]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="max-w-lg text-4xl leading-tight sm:text-5xl [font-family:var(--font-dental-display)]">
                Todo lo que tu boca necesita, <em className="text-[#9fd8cc]">en un solo lugar</em>.
              </h2>
              <p className="max-w-xs text-[#fbf8f3]/65">Primera valoración sin costo y plan de pagos en tratamientos largos.</p>
            </div>
            <div className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-[#fbf8f3]/10 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map(({ icon: Icon, name, text }) => (
                <div key={name} className="group bg-[#1d2b2a] p-8 transition hover:bg-[#24403c]">
                  <Icon className="size-7 text-[#9fd8cc] transition group-hover:scale-110" strokeWidth={1.5} />
                  <h3 className="mt-6 text-xl [font-family:var(--font-dental-display)]">{name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#fbf8f3]/65">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="nosotros" className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-24 sm:px-6 md:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            <Image src={unsplash('1588776814546-1ffcf47267a5', 700)} alt="Dentista revisando una radiografía" width={700} height={900} className="aspect-[3/4] w-full rounded-3xl object-cover" />
            <Image src={unsplash('1609840114035-3c981b782dfe', 700)} alt="Paciente con alineadores transparentes" width={700} height={900} className="mt-12 aspect-[3/4] w-full rounded-3xl object-cover" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f7d73]">Nosotros</p>
            <h2 className="mt-4 text-4xl leading-tight [font-family:var(--font-dental-display)]">La Dra. Alba Ríos y su equipo te atienden de principio a fin.</h2>
            <p className="mt-6 leading-relaxed text-[#1d2b2a]/75">
              Cirujana dentista por la Universidad de Guadalajara, con especialidad en ortodoncia. Usamos radiografía digital, material esterilizado en cada cita y te mandamos recordatorio por WhatsApp un día antes.
            </p>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-[#1d2b2a]/10 pt-8">
              {[['12', 'años de experiencia'], ['+3,000', 'pacientes atendidos'], ['4.9', 'en Google']].map(([n, l]) => (
                <div key={l}>
                  <dt className="text-3xl [font-family:var(--font-dental-display)]">{n}</dt>
                  <dd className="mt-1 text-xs text-[#1d2b2a]/60">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="opiniones" className="bg-[#efe6d8] py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-4xl [font-family:var(--font-dental-display)]">Lo que dicen nuestros pacientes</h2>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {REVIEWS.map((r) => (
                <figure key={r.name} className="rounded-3xl bg-[#fbf8f3] p-8">
                  <div className="flex gap-1 text-[#e0a526]">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</div>
                  <blockquote className="mt-5 text-lg leading-relaxed [font-family:var(--font-dental-display)]">“{r.text}”</blockquote>
                  <figcaption className="mt-6 text-sm font-semibold text-[#2f7d73]">{r.name} · Reseña de Google</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="ubicacion" className="mx-auto grid max-w-6xl gap-10 px-4 py-24 sm:px-6 md:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="text-4xl [font-family:var(--font-dental-display)]">Visítanos</h2>
            <ul className="mt-8 space-y-5 text-[#1d2b2a]/80">
              <li className="flex gap-3"><MapPin className="mt-0.5 size-5 shrink-0 text-[#2f7d73]" />Av. Chapultepec, col. Americana, Guadalajara, Jal.</li>
              <li className="flex gap-3"><Phone className="mt-0.5 size-5 shrink-0 text-[#2f7d73]" />33 0000 0000 · también por WhatsApp</li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-[#2f7d73]" />
                <table className="text-sm"><tbody>{HOURS.map(([d, h]) => <tr key={d}><td className="pr-6">{d}</td><td className="font-semibold">{h}</td></tr>)}</tbody></table>
              </li>
            </ul>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex rounded-full bg-[#2f7d73] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#25655d]">
              Escríbenos por WhatsApp
            </a>
          </div>
          <iframe
            title="Mapa de ubicación"
            src="https://www.google.com/maps?q=Av.+Chapultepec,+Americana,+Guadalajara&output=embed"
            className="h-80 w-full rounded-3xl border-0 grayscale-[30%] md:h-full md:min-h-96"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      </main>

      <footer className="border-t border-[#1d2b2a]/10 py-10 text-center text-sm text-[#1d2b2a]/60">
        <p className="text-lg text-[#1d2b2a] [font-family:var(--font-dental-display)]">Dental Alba</p>
        <p className="mt-2">Negocio ficticio · Página de ejemplo hecha por <a href="https://www.imsoft.io/es" className="font-semibold text-[#2f7d73]">imSoft</a></p>
      </footer>

      <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="Agendar por WhatsApp" className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-110">
        <WhatsAppIcon />
      </a>
    </div>
  )
}

export function WhatsAppIcon({ className = 'size-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.81 11.81 0 0 0 12.05 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41" />
    </svg>
  )
}
