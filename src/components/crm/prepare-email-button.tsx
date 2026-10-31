'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { prepareEmail } from './prepare-email'

export function PrepareEmailButton({ contactId, lang, variant = 'outline', action = 'write' }: { contactId: string; lang: string; variant?: 'outline' | 'default' | 'ghost'; action?: 'write' | 'open-draft' | 'follow-up' }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  return (
    <Button
      variant={variant}
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        const url = await prepareEmail(contactId, lang, { followUp: action === 'follow-up' })
        setBusy(false)
        if (url) router.push(url)
      }}
    >
      <Mail className="mr-2 h-4 w-4" />
      {busy ? (lang === 'en' ? 'Preparing…' : 'Preparando…') : action === 'follow-up' ? (lang === 'en' ? 'Write follow-up' : 'Escribir seguimiento') : action === 'open-draft' ? (lang === 'en' ? 'Open draft' : 'Abrir borrador') : lang === 'en' ? 'Write email' : 'Escribir correo'}
    </Button>
  )
}
