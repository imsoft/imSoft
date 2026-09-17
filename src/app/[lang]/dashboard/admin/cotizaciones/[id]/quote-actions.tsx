'use client'

import { imprimir } from '@/lib/print'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink, FileSignature, FolderPlus, Mail, MessageCircle, Pencil, Printer, Send } from 'lucide-react'
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

  const btn = 'h-9'
  const principal = quote.status === 'draft' ? (
    <Button size="sm" className={btn} onClick={marcarEnviada} disabled={ocupado !== null}><Send className="size-4 mr-1.5" />{es ? 'Marcar como enviada' : 'Mark as sent'}</Button>
  ) : quote.status === 'accepted' && !contract ? (
    <Button size="sm" className={btn} disabled={ocupado !== null} onClick={async () => { const j = await llamar(`/api/quotes/${quote.id}/contract`, 'contract', es ? 'Contrato generado' : 'Contract generated'); if (j?.id) router.push(`/${lang}/dashboard/admin/cotizaciones/${quote.id}/contrato`) }}>
      <FileSignature className="size-4 mr-1.5" />{es ? 'Generar contrato' : 'Generate contract'}
    </Button>
  ) : quote.status === 'accepted' && !quote.project_id ? (
    <Button size="sm" className={btn} disabled={ocupado !== null} onClick={() => llamar(`/api/quotes/${quote.id}/convert`, 'convert', es ? 'Proyecto creado' : 'Project created')}><FolderPlus className="size-4 mr-1.5" />{es ? 'Convertir en proyecto' : 'Convert to project'}</Button>
  ) : null

  return (
    <div className="no-print rounded-xl border bg-card p-4 space-y-4">
      {/* Fila 1: enlace publico con acciones de vista */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="flex h-9 min-w-0 flex-1 items-stretch overflow-hidden rounded-md border bg-background">
          <span className="flex items-center border-r bg-muted/60 px-2.5 text-xs font-medium text-muted-foreground">{es ? 'Enlace' : 'Link'}</span>
          <input readOnly value={publicUrl} onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 bg-transparent px-3 font-mono text-xs outline-none" />
          <button type="button" onClick={copiar} title={es ? 'Copiar enlace' : 'Copy link'} className="flex items-center gap-1.5 border-l px-3 text-xs font-medium text-primary hover:bg-accent"><Copy className="size-3.5" />{es ? 'Copiar' : 'Copy'}</button>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" className={btn} asChild><a href={publicUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4 mr-1.5" />{es ? 'Ver como cliente' : 'View as client'}</a></Button>
          <Button size="sm" variant="outline" className={btn} onClick={imprimir}><Printer className="size-4 mr-1.5" />PDF</Button>
        </div>
      </div>

      {/* Fila 2: accion principal, envio, edicion y eliminar */}
      <div className="flex flex-wrap items-center gap-2">
        {principal}
        {quote.status !== 'accepted' && (
          <div className="flex items-center gap-2 lg:border-l lg:pl-2">
            <Button size="sm" variant="outline" className={btn} asChild><a href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4 mr-1.5" />WhatsApp</a></Button>
            <Button size="sm" variant="outline" className={btn} disabled={!quote.client_email || ocupado !== null} onClick={() => llamar(`/api/quotes/${quote.id}/send`, 'mail', es ? 'Correo enviado al cliente' : 'Email sent to the client')}><Mail className="size-4 mr-1.5" />{es ? 'Correo' : 'Email'}</Button>
          </div>
        )}
        {contract && (
          <Button size="sm" variant="outline" className={btn} asChild><Link href={`/${lang}/dashboard/admin/cotizaciones/${quote.id}/contrato`}><FileSignature className="size-4 mr-1.5" />{es ? 'Contrato' : 'Contract'} · {contract.folio}</Link></Button>
        )}
        {quote.project_id && (
          <Button size="sm" variant="outline" className={btn} asChild><Link href={`/${lang}/dashboard/admin/projects/${quote.project_id}`}><FolderPlus className="size-4 mr-1.5" />{es ? 'Ver proyecto' : 'View project'}</Link></Button>
        )}
        <div className="ml-auto flex items-center gap-2">
          {quote.status !== 'accepted' && (
            <Button size="sm" variant="ghost" className={btn} asChild><Link href={`/${lang}/dashboard/admin/cotizaciones/${quote.id}/edit`}><Pencil className="size-4 mr-1.5" />{es ? 'Editar' : 'Edit'}</Link></Button>
          )}
          {!quote.project_id && contract?.status !== 'signed' && (
            <DeleteQuoteButton id={quote.id} folio={quote.folio} lang={lang} redirectTo={`/${lang}/dashboard/admin/cotizaciones`} />
          )}
        </div>
      </div>
      {quote.status === 'sent' && <p className="text-xs text-muted-foreground">{es ? 'Ya está enviada: si la editas, el cliente ve los cambios al instante en el mismo enlace. Una vez aceptada ya no se puede editar.' : 'Already sent: if you edit it, the client sees the changes instantly on the same link. Once accepted it can no longer be edited.'}</p>}
      {quote.status === 'draft' && <p className="text-xs text-muted-foreground">{es ? 'Mientras sea borrador, el enlace muestra la cotización pero no permite aceptarla.' : 'While it is a draft, the link shows the quote but does not allow acceptance.'}</p>}
      {quote.accepted_at && <p className="text-xs text-muted-foreground">{es ? 'Evidencia de aceptación' : 'Acceptance evidence'}: {quote.accepted_name} · {new Date(quote.accepted_at).toLocaleString('es-MX')} · IP {quote.accepted_ip}</p>}
    </div>
  )
}
