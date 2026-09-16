'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink, FileSignature, FolderPlus, Mail, Pencil, Printer, Send } from 'lucide-react'
import type { Contract, Quote } from '@/types/quotes'
import { DeleteQuoteButton } from '@/components/documents/delete-quote-button'

export function QuoteActions({ lang, quote, contract, publicUrl }: { lang: string; quote: Quote; contract: Contract | null; publicUrl: string }) {
  const es = lang !== 'en'
  const router = useRouter()
  const [ocupado, setOcupado] = useState<string | null>(null)

  async function marcarEnviada() {
    setOcupado('sent')
    const supabase = createClient()
    const { error } = await supabase.from('quotes').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', quote.id)
    setOcupado(null)
    if (error) return toast.error(error.message)
    toast.success(es ? 'Marcada como enviada: el cliente ya puede aceptarla en el enlace.' : 'Marked as sent: the client can now accept it.')
    router.refresh()
  }

  async function llamar(ruta: string, clave: string, okMsg: string) {
    setOcupado(clave)
    try {
      const r = await fetch(ruta, { method: 'POST' })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      toast.success(okMsg)
      router.refresh()
      return j
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setOcupado(null)
    }
  }

  const copiar = async () => { await navigator.clipboard.writeText(publicUrl); toast.success(es ? 'Enlace copiado' : 'Link copied') }
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(es ? `Hola ${quote.client_name}, aquí está la cotización ${quote.folio} de imSoft para "${quote.title}". La puedes revisar y aceptar en línea: ${publicUrl}` : `Hi ${quote.client_name}, here is imSoft's quote ${quote.folio} for "${quote.title}": ${publicUrl}`)}`

  return (
    <div className="no-print rounded-lg border bg-muted/40 p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <code className="text-xs bg-background border rounded px-2 py-1 break-all">{publicUrl}</code>
        <Button size="sm" variant="outline" onClick={copiar}><Copy className="size-4 mr-1" />{es ? 'Copiar enlace' : 'Copy link'}</Button>
        <Button size="sm" variant="outline" asChild><a href={publicUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4 mr-1" />{es ? 'Ver como cliente' : 'View as client'}</a></Button>
        <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="size-4 mr-1" />PDF</Button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {quote.status === 'draft' && (
          <>
            <Button size="sm" asChild variant="outline"><Link href={`/${lang}/dashboard/admin/cotizaciones/${quote.id}/edit`}><Pencil className="size-4 mr-1" />{es ? 'Editar' : 'Edit'}</Link></Button>
            <Button size="sm" onClick={marcarEnviada} disabled={ocupado !== null}><Send className="size-4 mr-1" />{es ? 'Marcar como enviada' : 'Mark as sent'}</Button>
          </>
        )}
        {quote.status !== 'accepted' && (
          <>
            <Button size="sm" variant="outline" asChild><a href={whatsapp} target="_blank" rel="noopener noreferrer">{es ? 'Enviar por WhatsApp' : 'Send via WhatsApp'}</a></Button>
            <Button size="sm" variant="outline" disabled={!quote.client_email || ocupado !== null} onClick={() => llamar(`/api/quotes/${quote.id}/send`, 'mail', es ? 'Correo enviado al cliente' : 'Email sent to the client')}><Mail className="size-4 mr-1" />{es ? 'Enviar por correo' : 'Send by email'}</Button>
          </>
        )}
        {quote.status === 'accepted' && !contract && (
          <Button size="sm" disabled={ocupado !== null} onClick={async () => { const j = await llamar(`/api/quotes/${quote.id}/contract`, 'contract', es ? 'Contrato generado' : 'Contract generated'); if (j?.id) router.push(`/${lang}/dashboard/admin/cotizaciones/${quote.id}/contrato`) }}>
            <FileSignature className="size-4 mr-1" />{es ? 'Generar contrato' : 'Generate contract'}
          </Button>
        )}
        {contract && (
          <Button size="sm" variant="outline" asChild><Link href={`/${lang}/dashboard/admin/cotizaciones/${quote.id}/contrato`}><FileSignature className="size-4 mr-1" />{es ? 'Ver contrato' : 'View contract'} · {contract.folio}</Link></Button>
        )}
        {quote.status === 'accepted' && !quote.project_id && (
          <Button size="sm" variant="outline" disabled={ocupado !== null} onClick={() => llamar(`/api/quotes/${quote.id}/convert`, 'convert', es ? 'Proyecto creado' : 'Project created')}><FolderPlus className="size-4 mr-1" />{es ? 'Convertir en proyecto' : 'Convert to project'}</Button>
        )}
        {quote.project_id && (
          <Button size="sm" variant="outline" asChild><Link href={`/${lang}/dashboard/admin/projects/${quote.project_id}`}>{es ? 'Ver proyecto' : 'View project'}</Link></Button>
        )}
        {!quote.project_id && contract?.status !== 'signed' && (
          <span className="ml-auto"><DeleteQuoteButton id={quote.id} folio={quote.folio} lang={lang} redirectTo={`/${lang}/dashboard/admin/cotizaciones`} /></span>
        )}
      </div>
      {quote.status === 'draft' && <p className="text-xs text-muted-foreground">{es ? 'Mientras sea borrador, el enlace muestra la cotización pero no permite aceptarla.' : 'While it is a draft, the link shows the quote but does not allow acceptance.'}</p>}
      {quote.accepted_at && <p className="text-xs text-muted-foreground">{es ? 'Evidencia de aceptación' : 'Acceptance evidence'}: {quote.accepted_name} · {new Date(quote.accepted_at).toLocaleString('es-MX')} · IP {quote.accepted_ip}</p>}
    </div>
  )
}
