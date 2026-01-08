'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye, Trash2, FileText } from 'lucide-react'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { Quotation } from '@/types/database'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface QuotationsTableProps {
  quotations: any[]
  dict: Dictionary
  lang: Locale
}

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  approved: 'bg-green-500/10 text-green-700 dark:text-green-400',
  rejected: 'bg-red-500/10 text-red-700 dark:text-red-400',
  converted: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
}

const statusLabels = {
  pending: { es: 'Pendiente', en: 'Pending' },
  approved: { es: 'Aprobada', en: 'Approved' },
  rejected: { es: 'Rechazada', en: 'Rejected' },
  converted: { es: 'Convertida', en: 'Converted' },
}

export function QuotationsTable({ quotations, dict, lang }: QuotationsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (quotations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {lang === 'en' ? 'No quotations yet' : 'Aún no hay cotizaciones'}
        </h3>
        <p className="text-muted-foreground mb-6">
          {lang === 'en'
            ? 'Start creating quotations to see them here'
            : 'Comienza creando cotizaciones para verlas aquí'}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{lang === 'en' ? 'Title' : 'Título'}</TableHead>
            <TableHead>{lang === 'en' ? 'Client' : 'Cliente'}</TableHead>
            <TableHead>{lang === 'en' ? 'Service' : 'Servicio'}</TableHead>
            <TableHead>{lang === 'en' ? 'Total' : 'Total'}</TableHead>
            <TableHead>{lang === 'en' ? 'Status' : 'Estado'}</TableHead>
            <TableHead>{lang === 'en' ? 'Date' : 'Fecha'}</TableHead>
            <TableHead className="text-right">{lang === 'en' ? 'Actions' : 'Acciones'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.map((quotation) => {
            const service = quotation.services as any
            const serviceName = lang === 'es'
              ? service?.title_es || service?.title
              : service?.title_en || service?.title

            return (
              <TableRow key={quotation.id}>
                <TableCell>
                  <div className="font-medium max-w-[200px] truncate">
                    {quotation.title || (lang === 'en' ? 'Untitled' : 'Sin título')}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{quotation.client_name || '-'}</div>
                    <div className="text-sm text-muted-foreground">{quotation.client_email || '-'}</div>
                  </div>
                </TableCell>
                <TableCell>{serviceName || '-'}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(quotation.total)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[quotation.status as keyof typeof statusColors]}>
                    {statusLabels[quotation.status as keyof typeof statusLabels][lang]}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(quotation.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/${lang}/dashboard/admin/quotations/${quotation.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
