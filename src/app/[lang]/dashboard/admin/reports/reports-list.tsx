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
  type: string
  format: string
  generatedAt: string
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
      {reports.map((report) => (
        <div
          key={report.id}
          className="flex items-center justify-between p-3 rounded-lg border bg-card"
        >
          <div>
            <div className="font-medium">{report.type}</div>
            <div className="text-sm text-muted-foreground">
              {new Date(report.generatedAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX')}
            </div>
          </div>
          {report.downloadUrl && (
            <a
              href={report.downloadUrl}
              download
              className="text-primary hover:underline text-sm"
            >
              {lang === 'en' ? 'Download' : 'Descargar'}
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

