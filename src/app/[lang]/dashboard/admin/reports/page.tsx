import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { ReportsGenerator } from './reports-generator'
import { ReportsList } from './reports-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download } from 'lucide-react'

export default async function AdminReportsPage({ params }: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect(`/${lang}/login`)
  }

  // Obtener reportes guardados (si existe una tabla de reportes)
  // Por ahora, simulamos que no hay reportes guardados
  const savedReports: any[] = []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dict.dashboard.admin.nav.reports}</h1>
        <p className="text-muted-foreground">
          {lang === 'en' ? 'Generate and download reports' : 'Genera y descarga reportes'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Generador de reportes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {lang === 'en' ? 'Generate Report' : 'Generar Reporte'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <ReportsGenerator dict={dict} lang={lang} />
          </CardContent>
        </Card>

        {/* Lista de reportes generados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              {lang === 'en' ? 'Recent Reports' : 'Reportes Recientes'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <ReportsList reports={savedReports} dict={dict} lang={lang} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
