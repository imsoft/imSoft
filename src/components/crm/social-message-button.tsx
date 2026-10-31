'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SocialMessageDialog, type MessageContact } from './social-message-dialog'

export function SocialMessageButton({ contact, lang }: { contact: MessageContact; lang: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <MessageCircle className="mr-2 h-4 w-4" />
        {lang === 'en' ? 'Social media message' : 'Mensaje para redes'}
      </Button>
      <SocialMessageDialog contact={contact} lang={lang} open={open} onClose={() => setOpen(false)} />
    </>
  )
}
