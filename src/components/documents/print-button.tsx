'use client'

import { imprimir } from '@/lib/print'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function PrintButton({ lang }: { lang: string }) {
  return (
    <Button size="sm" onClick={imprimir} className="border border-primary bg-white text-primary shadow-none hover:bg-primary hover:text-white">
      <Printer className="size-4 mr-1" />{lang === 'en' ? 'Print / save as PDF' : 'Imprimir / guardar PDF'}
    </Button>
  )
}
