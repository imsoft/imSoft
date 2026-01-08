'use client'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { FileText } from 'lucide-react'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'

interface Report {
  id: string
  report_type: string
  report_format: string
  file_name: string
  file_size?: number
  generated_at: string
  created_at: string
  downloadUrl?: string
}

interface ReportsListProps {
  reports: Report[]
  dict: Dictionary
  lang: Locale
}

export function ReportsList({ reports, dict, lang }: ReportsListProps) {
  if (reports.length === 0) {
    return (
      <div className="py-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText className="size-12" />
            </EmptyMedia>
            <EmptyTitle>{dict.dashboard.empty.reports.title}</EmptyTitle>
            <EmptyDescription>
              {dict.dashboard.empty.reports.description}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {reports.map((report) => {
        const reportTypeLabels: Record<string, { es: string; en: string }> = {
          users: { es: 'Usuarios', en: 'Users' },
          projects: { es: 'Proyectos', en: 'Projects' },
          services: { es: 'Servicios', en: 'Services' },
          portfolio: { es: 'Portafolio', en: 'Portfolio' },
          blog: { es: 'Blog', en: 'Blog' },
          testimonials: { es: 'Testimonios', en: 'Testimonials' },
          all: { es: 'Todos los Datos', en: 'All Data' },
        }
        const typeLabel = reportTypeLabels[report.report_type] || { es: report.report_type, en: report.report_type }
        const formatLabel = report.report_format.toUpperCase()
        
        return (
          <div
            key={report.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-card"
          >
            <div>
              <div className="font-medium">
                {lang === 'en' ? typeLabel.en : typeLabel.es} ({formatLabel})
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(report.generated_at || report.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              {report.file_name && (
                <div className="text-xs text-muted-foreground mt-1">
                  {report.file_name}
                </div>
              )}
            </div>
            <a
              href={`/api/reports?type=${report.report_type}&format=${report.report_format}`}
              download={report.file_name}
              className="text-primary hover:underline text-sm"
            >
              {lang === 'en' ? 'Download' : 'Descargar'}
            </a>
          </div>
        )
      })}
    </div>
  )
}

