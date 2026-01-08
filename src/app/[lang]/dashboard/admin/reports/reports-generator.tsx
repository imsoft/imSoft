'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FileText, Download, Loader2 } from 'lucide-react'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'

interface ReportsGeneratorProps {
  dict: Dictionary
  lang: Locale
}

type ReportType = 'users' | 'projects' | 'services' | 'portfolio' | 'blog' | 'testimonials' | 'all'
type ReportFormat = 'json' | 'csv'

export function ReportsGenerator({ dict, lang }: ReportsGeneratorProps) {
  const [reportType, setReportType] = useState<ReportType>('all')
  const [reportFormat, setReportFormat] = useState<ReportFormat>('json')
  const [isGenerating, setIsGenerating] = useState(false)

  const reportTypeLabels: Record<ReportType, { es: string; en: string }> = {
    users: { es: 'Usuarios', en: 'Users' },
    projects: { es: 'Proyectos', en: 'Projects' },
    services: { es: 'Servicios', en: 'Services' },
    portfolio: { es: 'Portafolio', en: 'Portfolio' },
    blog: { es: 'Blog', en: 'Blog' },
    testimonials: { es: 'Testimonios', en: 'Testimonials' },
    all: { es: 'Todos los Datos', en: 'All Data' },
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const fileName = `report-${reportType}-${new Date().toISOString().split('T')[0]}.${reportFormat}`
      
      // Generar el reporte
      const response = await fetch(`/api/reports?type=${reportType}&format=${reportFormat}`)
      
      if (!response.ok) {
        throw new Error('Error al generar el reporte')
      }

      const blob = await response.blob()
      
      // Descargar el archivo
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Guardar el reporte en la base de datos
      const saveResponse = await fetch('/api/reports/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_type: reportType,
          report_format: reportFormat,
          file_name: fileName,
          file_size: blob.size,
        }),
      })

      if (!saveResponse.ok) {
        console.error('Error saving report to database')
        // No fallar si no se puede guardar, solo mostrar advertencia
        toast.warning(lang === 'en' ? 'Report generated but could not be saved' : 'Reporte generado pero no se pudo guardar')
      }

      toast.success(lang === 'en' ? 'Report generated successfully' : 'Reporte generado exitosamente')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error(lang === 'en' ? 'Error generating report' : 'Error al generar el reporte', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="report-type">
          {lang === 'en' ? 'Report Type' : 'Tipo de Reporte'}
        </Label>
        <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
          <SelectTrigger id="report-type" className="w-full !border-2 !border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            {Object.entries(reportTypeLabels).map(([value, labels]) => (
              <SelectItem key={value} value={value}>
                {lang === 'en' ? labels.en : labels.es}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="report-format">
          {lang === 'en' ? 'Format' : 'Formato'}
        </Label>
        <Select value={reportFormat} onValueChange={(value) => setReportFormat(value as ReportFormat)}>
          <SelectTrigger id="report-format" className="w-full !border-2 !border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {lang === 'en' ? 'Generating...' : 'Generando...'}
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            {lang === 'en' ? 'Generate & Download' : 'Generar y Descargar'}
          </>
        )}
      </Button>
    </div>
  )
}

