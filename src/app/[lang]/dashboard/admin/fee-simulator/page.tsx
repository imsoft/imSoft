import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound } from 'next/navigation'
import { FeeSimulator } from './fee-simulator'

export default async function AdminFeeSimulatorPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dict.dashboard.admin.nav.feeSimulator}</h1>
        <p className="text-muted-foreground">
          {lang === 'en'
            ? 'What the client pays, what Stripe keeps, what goes to SAT and what you keep, per milestone and payment method.'
            : 'Cuánto paga el cliente, cuánto se queda Stripe, cuánto va al SAT y cuánto te queda, por hito y por forma de pago.'}
        </p>
      </div>
      <FeeSimulator lang={lang} />
    </div>
  )
}
