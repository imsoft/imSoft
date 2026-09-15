import { notFound } from 'next/navigation'
import { hasLocale } from '../../../../dictionaries'
import { requireAdmin } from '@/lib/quotes/server'
import { placesConfigurado } from '@/lib/places-server'
import { CrmTabs } from '../crm-tabs'
import { BuscarProspectos } from './buscar-prospectos'

export const dynamic = 'force-dynamic'

export default async function BuscarProspectosPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const auth = await requireAdmin()
  if (!auth.ok) notFound()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CRM</h1>
        <p className="text-muted-foreground">
          {lang === 'en' ? 'Find businesses in the Guadalajara metro area with Google Maps and add them as prospects.' : 'Encuentra negocios de la zona metropolitana con Google Maps y agrégalos como prospectos.'}
        </p>
      </div>
      <CrmTabs lang={lang} activa="buscar" />
      <BuscarProspectos lang={lang} configurado={placesConfigurado()} />
    </div>
  )
}
