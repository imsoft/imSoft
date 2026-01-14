'use client'

import { Deal } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface DealsTableProps {
  deals: Deal[]
  dict: any
  lang: string
}

export function DealsTable({ deals, dict, lang }: DealsTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'en' ? 'Are you sure you want to delete this deal?' : '¿Estás seguro de que quieres eliminar este negocio?')) {
      return
    }

    setIsDeleting(id)
    const supabase = createClient()

    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting deal:', error)
      alert(lang === 'en' ? 'Error deleting deal' : 'Error al eliminar negocio')
    } else {
      router.refresh()
    }

    setIsDeleting(null)
  }

  const getStageLabel = (stage: string) => {
    const labels: Record<string, { en: string; es: string }> = {
      no_contact: { en: 'No Contact', es: 'Sin Contacto' },
      qualification: { en: 'Prospecting', es: 'Prospección' },
      proposal: { en: 'Proposal', es: 'Propuesta' },
      negotiation: { en: 'Negotiation', es: 'Negociación' },
      closed_won: { en: 'Closed Won', es: 'Ganado' },
      closed_lost: { en: 'Closed Lost', es: 'Perdido' },
    }
    return lang === 'en' ? labels[stage]?.en || stage : labels[stage]?.es || stage
  }

  const stageColors: Record<string, string> = {
    no_contact: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
    qualification: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    proposal: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    negotiation: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    closed_won: 'bg-green-500/10 text-green-700 dark:text-green-400',
    closed_lost: 'bg-red-500/10 text-red-700 dark:text-red-400',
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX')
  }

  if (deals.length === 0) {
    return (
      <Card className="p-12 bg-white">
        <div className="text-center">
          <p className="text-muted-foreground">
            {lang === 'en' ? 'No deals yet. Create your first deal!' : '¡No hay negocios todavía. Crea tu primer negocio!'}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">
                {lang === 'en' ? 'Deal Name' : 'Nombre del Negocio'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                {lang === 'en' ? 'Contact' : 'Contacto'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                {lang === 'en' ? 'Service' : 'Servicio'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                {lang === 'en' ? 'Value' : 'Valor'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                {lang === 'en' ? 'Stage' : 'Etapa'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                {lang === 'en' ? 'Expected Close' : 'Cierre Esperado'}
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium">
                {lang === 'en' ? 'Actions' : 'Acciones'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {deals.map((deal: any) => (
              <tr key={deal.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{deal.title}</p>
                    {deal.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {deal.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {deal.contacts ? (
                    <div>
                      <p className="text-sm">
                        {deal.contacts.first_name} {deal.contacts.last_name}
                      </p>
                      {deal.contacts.company && (
                        <p className="text-xs text-muted-foreground">{deal.contacts.company}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {deal.services ? (
                    <span className="text-sm">
                      {lang === 'en' ? deal.services.title_en : deal.services.title_es}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{formatCurrency(deal.value)}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge className={stageColors[deal.stage]}>
                    {getStageLabel(deal.stage)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm">{formatDate(deal.expected_close_date)}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/${lang}/dashboard/admin/crm/deals/${deal.id}`}>
                        <Eye className="size-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/${lang}/dashboard/admin/crm/deals/${deal.id}/edit`}>
                        <Edit className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(deal.id)}
                      disabled={isDeleting === deal.id}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
