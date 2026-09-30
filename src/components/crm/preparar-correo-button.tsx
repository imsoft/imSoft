'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { prepararCorreo } from './preparar-correo'

export function PrepararCorreoButton({ contactId, lang, variant = 'outline', accion = 'escribir' }: { contactId: string; lang: string; variant?: 'outline' | 'default' | 'ghost'; accion?: 'escribir' | 'abrir-borrador' | 'seguimiento' }) {
  const router = useRouter()
  const [ocupado, setOcupado] = useState(false)
  return (
    <Button
      variant={variant}
      disabled={ocupado}
      onClick={async () => {
        setOcupado(true)
        const url = await prepararCorreo(contactId, lang, { seguimiento: accion === 'seguimiento' })
        setOcupado(false)
        if (url) router.push(url)
      }}
    >
      <Mail className="mr-2 h-4 w-4" />
      {ocupado ? (lang === 'en' ? 'Preparing…' : 'Preparando…') : accion === 'seguimiento' ? (lang === 'en' ? 'Write follow-up' : 'Escribir seguimiento') : accion === 'abrir-borrador' ? (lang === 'en' ? 'Open draft' : 'Abrir borrador') : lang === 'en' ? 'Write email' : 'Escribir correo'}
    </Button>
  )
}
