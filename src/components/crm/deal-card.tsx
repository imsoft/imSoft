'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, User, GripVertical, Mail, MailCheck } from 'lucide-react'
import Link from 'next/link'
import type { Deal } from '@/types/database'

interface DealCardProps {
  deal: Deal & {
    contacts?: {
      first_name: string
      last_name: string
      email: string
      phone?: string
      company?: string
    }
    email_sent?: boolean
  }
  lang: string
}

export function DealCard({ deal, lang }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="p-4 bg-white hover:shadow-md transition-shadow group">
        <div className="space-y-3">
          {/* Header con drag handle */}
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/${lang}/dashboard/admin/crm/deals/${deal.id}`}
              className="flex-1 min-w-0"
            >
              <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                {deal.title}
              </h3>
            </Link>
            <button
              className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing shrink-0"
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Valor */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-bold text-green-600">
              {formatCurrency(deal.value)}
            </span>
          </div>

          {/* Contacto */}
          {deal.contacts && (
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">
                  {deal.contacts.first_name} {deal.contacts.last_name}
                </p>
                {deal.contacts.company && (
                  <p className="text-xs text-muted-foreground truncate">
                    {deal.contacts.company}
                  </p>
                )}
                {deal.contacts.email && (
                  <p className="text-xs text-muted-foreground truncate">
                    {deal.contacts.email}
                  </p>
                )}
                {deal.contacts.phone && (
                  <p className="text-xs text-muted-foreground truncate">
                    {deal.contacts.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Badges: Email enviado y Probability */}
          <div className="flex items-center justify-between gap-2">
            {/* Badge de correo enviado */}
            {deal.stage !== 'no_contact' && (
              <Badge 
                variant={deal.email_sent ? "default" : "outline"}
                className={`text-xs flex items-center gap-1 ${
                  deal.email_sent 
                    ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' 
                    : 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
                }`}
              >
                {deal.email_sent ? (
                  <>
                    <MailCheck className="h-3 w-3" />
                    {lang === 'en' ? 'Email Sent' : 'Correo Enviado'}
                  </>
                ) : (
                  <>
                    <Mail className="h-3 w-3" />
                    {lang === 'en' ? 'No Email' : 'Sin Correo'}
                  </>
                )}
              </Badge>
            )}
            {/* Probability badge si existe */}
            {deal.probability !== null && deal.probability !== undefined && (
              <Badge variant="outline" className="text-xs">
                {deal.probability}%
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
