'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function PrintButton({ lang }: { lang: string }) {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()}>
      <Printer className="size-4 mr-1" />{lang === 'en' ? 'Print / save as PDF' : 'Imprimir / guardar PDF'}
    </Button>
  )
}
