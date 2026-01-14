'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, GripVertical, Mail, Phone, Building2 } from 'lucide-react'
import Link from 'next/link'
import type { Contact } from '@/types/database'

interface ContactCardProps {
  contact: Contact
  lang: string
}

export function ContactCard({ contact, lang }: ContactCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: contact.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getContactTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; es: string }> = {
      lead: { en: 'Lead', es: 'Lead' },
      prospect: { en: 'Prospect', es: 'Prospecto' },
      customer: { en: 'Customer', es: 'Cliente' },
      partner: { en: 'Partner', es: 'Socio' },
    }
    return lang === 'en' ? labels[type]?.en || type : labels[type]?.es || type
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
      inactive: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
      lost: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    }
    return colors[status] || 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; es: string }> = {
      active: { en: 'Active', es: 'Activo' },
      inactive: { en: 'Inactive', es: 'Inactivo' },
      lost: { en: 'Lost', es: 'Perdido' },
    }
    return lang === 'en' ? labels[status]?.en || status : labels[status]?.es || status
  }

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <Card className="p-4 bg-white hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border-2 border-transparent hover:border-primary/20">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Link
                href={`/${lang}/dashboard/admin/crm/contacts/${contact.id}`}
                className="flex-1 min-w-0 group"
              >
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                  {contact.first_name} {contact.last_name}
                </h3>
              </Link>
            </div>

            {/* Contact Info */}
            <div className="space-y-1.5 mb-3">
              {contact.company && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{contact.company}</span>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{contact.phone}</span>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {getContactTypeLabel(contact.contact_type)}
              </Badge>
              <Badge variant="outline" className={`text-xs ${getStatusColor(contact.status)}`}>
                {getStatusLabel(contact.status)}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
