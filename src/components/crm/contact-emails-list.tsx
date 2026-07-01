'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Copy, Check, Send, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { Contact } from '@/types/database'

interface ContactEmailsListProps {
  contact: Contact
  lang: string
}

export function ContactEmailsList({ contact, lang }: ContactEmailsListProps) {
  const router = useRouter()
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null)
  
  // Local state for invalid emails to provide instant UI feedback
  const [invalidEmails, setInvalidEmails] = useState<string[]>(
    contact.invalid_emails || []
  )

  const emailsList = [
    { email: contact.email, isPrimary: true },
    ...(contact.additional_emails || []).map((email) => ({
      email,
      isPrimary: false,
    })),
  ]

  const handleCopy = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email)
      setCopiedEmail(email)
      toast.success(lang === 'en' ? 'Email copied' : 'Correo copiado')
      setTimeout(() => setCopiedEmail(null), 2000)
    } catch (error) {
      console.error('Copy error:', error)
      toast.error(lang === 'en' ? 'Failed to copy' : 'Error al copiar')
    }
  }

  const handleToggleStatus = async (email: string, currentIsInvalid: boolean) => {
    setLoadingEmail(email)
    try {
      const response = await fetch(`/api/crm/contacts/${contact.id}/email-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          isInvalid: !currentIsInvalid,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update email status')
      }

      const data = await response.json()
      setInvalidEmails(data.invalidEmails || [])
      
      toast.success(
        !currentIsInvalid
          ? (lang === 'en' ? 'Email marked as non-existent' : 'Correo marcado como inexistente')
          : (lang === 'en' ? 'Email marked as active' : 'Correo marcado como activo')
      )
      
      router.refresh()
    } catch (error) {
      console.error('Toggle email status error:', error)
      toast.error(
        lang === 'en'
          ? 'Error updating email status'
          : 'Error al actualizar estado del correo'
      )
    } finally {
      setLoadingEmail(null)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Mail className="h-5 w-5 text-muted-foreground" />
          {lang === 'en' ? 'Email Addresses' : 'Direcciones de Correo'}
        </h2>
      </div>

      <div className="space-y-3">
        {emailsList.map(({ email, isPrimary }) => {
          const isInvalid = invalidEmails.some(
            (e) => e.toLowerCase() === email.toLowerCase()
          )
          const isCopied = copiedEmail === email
          const isLoading = loadingEmail === email

          return (
            <div
              key={email}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all ${
                isInvalid
                  ? 'border-red-200 bg-red-50/30 dark:border-red-900/30 dark:bg-red-950/10'
                  : 'border-border bg-card hover:bg-accent/30'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    isInvalid
                      ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isInvalid ? (
                    <AlertTriangle className="size-4 shrink-0" />
                  ) : (
                    <Mail className="size-4 shrink-0" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-medium truncate ${
                        isInvalid
                          ? 'text-red-700 dark:text-red-400 line-through opacity-70'
                          : 'text-foreground'
                      }`}
                      title={email}
                    >
                      {email}
                    </span>

                    {isPrimary && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 uppercase tracking-wider font-semibold">
                        {lang === 'en' ? 'Primary' : 'Principal'}
                      </Badge>
                    )}

                    {isInvalid && (
                      <Badge
                        variant="destructive"
                        className="text-[10px] py-0 px-1.5 h-4 bg-red-600 hover:bg-red-600 text-white dark:bg-red-900 dark:hover:bg-red-900 font-bold uppercase tracking-wider animate-pulse"
                      >
                        {lang === 'en' ? 'No longer exists / Bounced' : 'No existe / Rebotado'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 sm:mt-0 ml-0 sm:ml-4 shrink-0 self-end sm:self-center">
                {/* Copy Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleCopy(email)}
                  title={lang === 'en' ? 'Copy email' : 'Copiar correo'}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>

                {/* Send Email Button */}
                {!isInvalid && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    asChild
                    title={lang === 'en' ? 'Send email' : 'Enviar correo'}
                  >
                    <Link
                      href={`/${lang}/dashboard/admin/crm/contacts/${
                        contact.id
                      }/send-email?to=${encodeURIComponent(email)}`}
                    >
                      <Send className="h-4 w-4" />
                    </Link>
                  </Button>
                )}

                {/* Toggle Validity Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${
                    isInvalid
                      ? 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30'
                      : 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                  }`}
                  onClick={() => handleToggleStatus(email, isInvalid)}
                  disabled={isLoading}
                  title={
                    isLoading
                      ? (lang === 'en' ? 'Processing...' : 'Procesando...')
                      : isInvalid
                      ? (lang === 'en' ? 'Mark as valid/active' : 'Marcar como válido/activo')
                      : (lang === 'en' ? 'Mark as non-existent (Bounced)' : 'Marcar como inexistente (Rebotado)')
                  }
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : isInvalid ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
