import Image from 'next/image'
import { Anton, Barlow } from 'next/font/google'
import { Clock, MapPin, Phone, Star, Wrench } from 'lucide-react'
import { demoWhatsAppHref, unsplash } from '@/lib/demo-sites'
import { DemoRibbon } from './demo-ribbon'
import { WhatsAppIcon } from './dental-demo'

const display = Anton({ subsets: ['latin'], weight: '400', variable: '--font-garage-display' })
const body = Barlow({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-garage-body' })

const SERVICES = [
  ['Afinación mayor y menor', 'Bujías, filtros, limpieza de inyectores y escaneo. Te decimos el precio antes de tocar el coche.'],
  ['Frenos', 'Balatas, discos y líquido. Revisión gratis mientras esperas.'],
  ['Suspensión y dirección', 'Amortiguadores, rótulas, terminales y alineación.'],
  ['Cambio de aceite', 'Aceite sintético o convencional con filtro, en 30 minutos.'],
  ['Diagnóstico por computadora', 'Leemos los códigos del tablero y te explicamos qué tiene, sin rodeos.'],
  ['Clutch y transmisión', 'Kit de clutch, volante y revisión de caja estándar o automática.'],
]

const STEPS = [
  ['Escríbenos', 'Mándanos por WhatsApp el modelo y qué le pasa a tu coche.'],
  ['Te cotizamos', 'Te damos un precio claro antes de empezar. Sin sorpresas.'],
  ['Lo dejamos listo', 'Te mandamos fotos del avance y te avisamos cuando esté.'],
]

const REVIEWS = [
  { name: 'Carlos M.', text: 'Honestos de verdad: me dijeron que solo eran las balatas cuando en otro lado me querían cambiar todo.' },
  { name: 'Ana V.', text: 'Me mandaron fotos de la pieza dañada por WhatsApp. Así da gusto dejar el coche.' },
  { name: 'Ricardo S.', text: 'Afinación lista el mismo día y a buen precio. Ya llevo tres años con ellos.' },
]

export function GarageDemo() {
  const wa = demoWhatsAppHref('taller-mecanico')
  return (
    <div className={`${display.variable} ${body.variable} min-h-screen bg-[#111111] text-[#f2f0ea] [font-family:var(--font-garage-body)]`}>
      <DemoRibbon slug="taller-mecanico" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111111]/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#inicio" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center bg-[#ffc531] text-[#111111]"><Wrench className="size-5" strokeWidth={2.5} /></span>
            <span className="text-2xl uppercase tracking-wide [font-family:var(--font-garage-display)]">Taller Ledesma</span>
          </a>
          <div className="hidden items-center gap-8 text-sm font-semibold uppercase tracking-wider md:flex">
            <a href="#servicios" className="hover:text-[#ffc531]">Servicios</a>
            <a href="#como" className="hover:text-[#ffc531]">Cómo trabajamos</a>
            <a href="#ubicacion" className="hover:text-[#ffc531]">Ubicación</a>
          </div>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="bg-[#ffc531] px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-[#111111] transition hover:bg-white">
            Cotizar
          </a>
        </nav>
      </header>

      <main id="inicio">
        <section className="relative isolate overflow-hidden">
          <Image src={unsplash('1625047509168-a7026f36de04', 1800)} alt="Mecánico revisando el motor de una camioneta" width={1800} height={1100} priority className="absolute inset-0 -z-10 h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#111111] via-[#111111]/80 to-transparent" aria-hidden />
          <div className="mx-auto max-w-6xl px-4 pb-28 pt-20 sm:px-6 md:pb-36 md:pt-32">
            <p className="inline-block bg-[#ffc531] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#111111] animate-in fade-in duration-500">Desde 1998 en Zapopan</p>
            <h1 className="mt-6 max-w-3xl text-6xl uppercase leading-[0.95] sm:text-8xl [font-family:var(--font-garage-display)] animate-in fade-in slide-in-from-left-6 duration-700">
              Tu coche en manos <span className="text-[#ffc531]">de confianza</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-[#f2f0ea]/80 animate-in fade-in duration-1000">
              Mecánica general, frenos, suspensión y diagnóstico por computadora. Te damos el precio antes de empezar y te mandamos fotos del avance.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[#25D366] px-7 py-4 text-sm font-bold uppercase tracking-wider text-white transition hover:brightness-110">
                <WhatsAppIcon className="size-5" /> Cotiza por WhatsApp
              </a>
              <a href="#servicios" className="border-2 border-white/40 px-7 py-4 text-sm font-bold uppercase tracking-wider transition hover:border-[#ffc531] hover:text-[#ffc531]">
                Ver servicios
              </a>
            </div>
            <div className="mt-14 flex items-center gap-3 text-sm">
              <div className="flex text-[#ffc531]">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</div>
              <span><strong>4.8</strong> · 240 reseñas en Google</span>
            </div>
          </div>
          <div className="h-3 bg-[repeating-linear-gradient(135deg,#ffc531_0_18px,#111111_18px_36px)]" aria-hidden />
        </section>

        <section id="servicios" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <h2 className="text-5xl uppercase sm:text-6xl [font-family:var(--font-garage-display)]">Servicios</h2>
          <div className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(([name, text], i) => (
              <div key={name} className="group relative bg-[#111111] p-8 transition hover:bg-[#1b1b1b]">
                <span className="text-5xl text-white/10 transition group-hover:text-[#ffc531] [font-family:var(--font-garage-display)]">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-4 text-xl font-bold uppercase tracking-wide">{name}</h3>
                <p className="mt-3 text-[#f2f0ea]/65">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-1 sm:grid-cols-3">
          {[
            ['1530046339160-ce3e530c7d2f', 'Pared de herramientas del taller'],
            ['1619642751034-765dfdf7c58e', 'Mecánico ajustando una pieza del motor'],
            ['1487754180451-c456f719a1fc', 'Cambio de aceite'],
          ].map(([id, alt]) => (
            <Image key={id} src={unsplash(id, 900)} alt={alt} width={900} height={700} className="aspect-[4/3] w-full object-cover grayscale transition duration-500 hover:grayscale-0" />
          ))}
        </section>

        <section id="como" className="bg-[#ffc531] py-24 text-[#111111]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-5xl uppercase sm:text-6xl [font-family:var(--font-garage-display)]">Así trabajamos</h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3">
              {STEPS.map(([title, text], i) => (
                <li key={title} className="border-t-4 border-[#111111] pt-6">
                  <span className="text-sm font-bold uppercase tracking-[0.2em]">Paso {i + 1}</span>
                  <h3 className="mt-2 text-3xl uppercase [font-family:var(--font-garage-display)]">{title}</h3>
                  <p className="mt-3 font-medium">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <h2 className="text-5xl uppercase sm:text-6xl [font-family:var(--font-garage-display)]">Clientes que regresan</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <figure key={r.name} className="border border-white/10 p-8">
                <div className="flex text-[#ffc531]">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</div>
                <blockquote className="mt-5 text-lg leading-relaxed">“{r.text}”</blockquote>
                <figcaption className="mt-6 text-sm font-bold uppercase tracking-wider text-[#ffc531]">{r.name}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="ubicacion" className="border-t border-white/10">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-24 sm:px-6 md:grid-cols-[1fr_1.3fr]">
            <div>
              <h2 className="text-5xl uppercase [font-family:var(--font-garage-display)]">Encuéntranos</h2>
              <ul className="mt-8 space-y-5 text-[#f2f0ea]/80">
                <li className="flex gap-3"><MapPin className="mt-0.5 size-5 shrink-0 text-[#ffc531]" />Av. Guadalupe, col. Chapalita, Zapopan, Jal.</li>
                <li className="flex gap-3"><Phone className="mt-0.5 size-5 shrink-0 text-[#ffc531]" />33 0000 0000 · WhatsApp</li>
                <li className="flex gap-3"><Clock className="mt-0.5 size-5 shrink-0 text-[#ffc531]" />Lunes a viernes 8:30 – 18:30 · Sábado 8:30 – 14:00</li>
              </ul>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center gap-3 bg-[#ffc531] px-7 py-4 text-sm font-bold uppercase tracking-wider text-[#111111] transition hover:bg-white">
                Agenda tu servicio
              </a>
            </div>
            <iframe
              title="Mapa de ubicación"
              src="https://www.google.com/maps?q=Av.+Guadalupe,+Chapalita,+Zapopan&output=embed"
              className="h-80 w-full border-0 grayscale md:h-full md:min-h-96"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-10 text-center text-sm text-[#f2f0ea]/55">
        <p className="text-xl uppercase text-[#f2f0ea] [font-family:var(--font-garage-display)]">Taller Ledesma</p>
        <p className="mt-2">Negocio ficticio · Página de ejemplo hecha por <a href="https://www.imsoft.io/es" className="font-semibold text-[#ffc531]">imSoft</a></p>
      </footer>

      <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="Cotizar por WhatsApp" className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-110">
        <WhatsAppIcon />
      </a>
    </div>
  )
}
