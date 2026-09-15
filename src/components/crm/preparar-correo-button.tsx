'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { prepararCorreo } from './preparar-correo'

export function PrepararCorreoButton({ contactId, lang, variant = 'outline' }: { contactId: string; lang: string; variant?: 'outline' | 'default' | 'ghost' }) {
  const router = useRouter()
  const [ocupado, setOcupado] = useState(false)
  return (
    <Button
      variant={variant}
      disabled={ocupado}
      onClick={async () => {
        setOcupado(true)
        const url = await prepararCorreo(contactId, lang)
        setOcupado(false)
        if (url) router.push(url)
      }}
    >
      <Mail className="mr-2 h-4 w-4" />
      {ocupado ? (lang === 'en' ? 'Preparing…' : 'Preparando…') : lang === 'en' ? 'Write email' : 'Escribir correo'}
    </Button>
  )
}
