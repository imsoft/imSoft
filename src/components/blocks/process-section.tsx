import { Phone, FileText, Code2, Rocket } from 'lucide-react'

interface ProcessSectionProps {
  lang: string
}

const steps = {
  es: [
    {
      icon: Phone,
      number: '01',
      title: 'Llamada de descubrimiento',
      description: 'Agendas una llamada gratis de 30 min. Platicamos tu idea, tus objetivos y cualquier duda. Sin compromiso.',
    },
    {
      icon: FileText,
      number: '02',
      title: 'Propuesta con precio fijo',
      description: 'En 48 horas recibes una propuesta detallada: alcance, entregables, cronograma y precio fijo. Sin sorpresas al final.',
    },
    {
      icon: Code2,
      number: '03',
      title: 'Desarrollo ágil',
      description: 'Desarrollamos en sprints cortos con entregas visibles. Tienes acceso a un tablero en vivo para ver el avance en tiempo real.',
    },
    {
      icon: Rocket,
      number: '04',
      title: 'Entrega y soporte',
      description: 'Lanzamos juntos. Te entregamos el código 100% tuyo, documentación y soporte el primer mes incluido.',
    },
  ],
  en: [
    {
      icon: Phone,
      number: '01',
      title: 'Discovery call',
      description: 'Book a free 30-min call. We talk through your idea, goals and any questions you have. No commitment.',
    },
    {
      icon: FileText,
      number: '02',
      title: 'Fixed-price proposal',
      description: 'Within 48 hours you receive a detailed proposal: scope, deliverables, timeline and a fixed price. No surprises.',
    },
    {
      icon: Code2,
      number: '03',
      title: 'Agile development',
      description: 'We build in short sprints with visible deliveries. You get access to a live board to track progress in real time.',
    },
    {
      icon: Rocket,
      number: '04',
      title: 'Launch & support',
      description: "We launch together. We hand over 100% your code, documentation and first-month support included.",
    },
  ],
}

export function ProcessSection({ lang }: ProcessSectionProps) {
  const isEs = lang === 'es'
  const currentSteps = isEs ? steps.es : steps.en

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-primary text-sm font-semibold tracking-widest uppercase mb-3">
            {isEs ? 'Proceso' : 'Process'}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
            {isEs ? 'Cómo trabajamos' : 'How we work'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            {isEs
              ? 'Un proceso claro y sin sorpresas. Sabes exactamente qué pasa en cada etapa.'
              : 'A clear process with no surprises. You always know what happens at each stage.'}
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line — desktop only */}
          <div
            className="hidden lg:block absolute left-[calc(12.5%-40px)] right-[calc(12.5%-40px)] h-px bg-border"
            style={{ top: '2.5rem' }}
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {currentSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={step.number}
                  className="group relative flex flex-col items-center text-center"
                >
                  {/* Number badge + icon */}
                  <div className="relative z-10 mb-5">
                    <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-background border-2 border-border shadow-sm transition-all duration-300 group-hover:border-primary group-hover:shadow-md group-hover:-translate-y-1">
                      <Icon className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <span className="absolute -top-3 -right-3 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-black shadow">
                      {index + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
