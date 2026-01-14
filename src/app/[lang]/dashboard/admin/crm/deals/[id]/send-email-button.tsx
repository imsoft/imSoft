'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface SendEmailButtonProps {
  dealId: string
  dealStage: string
  lang: string
  contactEmail?: string
  emailsSentCount?: number
}

export function SendEmailButton({ dealId, dealStage, lang, contactEmail, emailsSentCount = 0 }: SendEmailButtonProps) {
  const router = useRouter()

  const getStageLabel = (stage: string) => {
    const labels: Record<string, { en: string; es: string }> = {
      no_contact: { en: 'No Contact', es: 'Sin Contacto' },
      qualification: { en: 'Prospecting', es: 'Prospección' },
      proposal: { en: 'Proposal', es: 'Propuesta' },
      negotiation: { en: 'Negotiation', es: 'Negociación' },
      closed_won: { en: 'Won', es: 'Ganado' },
      closed_lost: { en: 'Lost', es: 'Perdido' },
    }
    return lang === 'en' ? labels[stage]?.en || stage : labels[stage]?.es || stage
  }

  const handleEmailClick = async () => {
    // Si no hay email del contacto, mostrar error
    if (!contactEmail) {
      toast.error(lang === 'en'
        ? 'Contact email is required to send email.'
        : 'Se requiere el correo del contacto para enviar el email.')
      return
    }

    // Redirigir a la página de envío de email
    router.push(`/${lang}/dashboard/admin/crm/deals/${dealId}/send-email`)
  }


  return (
    <Button
      variant="outline"
      onClick={handleEmailClick}
      className="relative"
    >
      <Mail className="mr-2 h-4 w-4" />
      {lang === 'en' ? 'Send Email' : 'Enviar Email'}
      {emailsSentCount > 0 && (
        <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
          {emailsSentCount}
        </span>
      )}
    </Button>
  )
}
