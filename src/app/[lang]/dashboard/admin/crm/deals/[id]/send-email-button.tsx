'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface SendEmailButtonProps {
  dealId: string
  dealStage: string
  lang: string
}

export function SendEmailButton({ dealId, dealStage, lang }: SendEmailButtonProps) {
  const router = useRouter()
  const [isSending, setIsSending] = useState(false)

  const getStageLabel = (stage: string) => {
    const labels: Record<string, { en: string; es: string }> = {
      qualification: { en: 'Qualification', es: 'Calificación' },
      proposal: { en: 'Proposal', es: 'Propuesta' },
      negotiation: { en: 'Negotiation', es: 'Negociación' },
      closed_won: { en: 'Won', es: 'Ganado' },
      closed_lost: { en: 'Lost', es: 'Perdido' },
    }
    return lang === 'en' ? labels[stage]?.en || stage : labels[stage]?.es || stage
  }

  const handleSendEmail = async () => {
    if (!confirm(
      lang === 'en'
        ? `Are you sure you want to send an email based on the "${getStageLabel(dealStage)}" stage?`
        : `¿Estás seguro de que quieres enviar un email basado en la etapa "${getStageLabel(dealStage)}"?`
    )) {
      return
    }

    setIsSending(true)

    try {
      const response = await fetch(`/api/crm/deals/${dealId}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      alert(
        lang === 'en'
          ? 'Email sent successfully!'
          : '¡Email enviado exitosamente!'
      )

      router.refresh()
    } catch (error) {
      console.error('Error sending email:', error)
      alert(
        lang === 'en'
          ? `Error sending email: ${error instanceof Error ? error.message : 'Unknown error'}`
          : `Error al enviar email: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleSendEmail}
      disabled={isSending}
    >
      <Mail className="mr-2 h-4 w-4" />
      {isSending
        ? (lang === 'en' ? 'Sending...' : 'Enviando...')
        : (lang === 'en' ? 'Send Email' : 'Enviar Email')}
    </Button>
  )
}
