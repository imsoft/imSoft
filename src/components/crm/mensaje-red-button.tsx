'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MensajeRedDialog, type ContactoParaMensaje } from './mensaje-red-dialog'

export function MensajeRedButton({ contacto, lang }: { contacto: ContactoParaMensaje; lang: string }) {
  const [abierto, setAbierto] = useState(false)
  return (
    <>
      <Button variant="outline" onClick={() => setAbierto(true)}>
        <MessageCircle className="mr-2 h-4 w-4" />
        {lang === 'en' ? 'Social media message' : 'Mensaje para redes'}
      </Button>
      <MensajeRedDialog contacto={contacto} lang={lang} abierto={abierto} onClose={() => setAbierto(false)} />
    </>
  )
}
