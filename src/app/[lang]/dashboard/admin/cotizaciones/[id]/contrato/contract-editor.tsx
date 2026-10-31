'use client'

import { printPage } from '@/lib/print'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Copy, ExternalLink, Printer, Save, Send } from 'lucide-react'
import { ContractDocument, type HashCheck } from '@/components/documents/contract-document'
import type { Contract, Quote } from '@/types/quotes'

export function ContractEditor({ lang, quote, contract, publicUrl, hashCheck }: { lang: string; quote: Quote; contract: Contract; publicUrl: string; hashCheck?: HashCheck | null }) {
  const es = lang !== 'en'
  const router = useRouter()
  const [html, setHtml] = useState(contract.body_html)
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const locked = contract.status === 'signed'

  async function save(extra: Partial<Contract> = {}) {
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.from('contracts').update({ body_html: html, updated_at: new Date().toISOString(), ...extra }).eq('id', contract.id)
    setBusy(false)
    if (error) return toast.error(error.message)
    toast.success(extra.status === 'sent' ? (es ? 'Contrato enviado: el cliente ya puede aceptarlo en el enlace.' : 'Contract sent.') : (es ? 'Contrato guardado' : 'Contract saved'))
    setEditing(false)
    router.refresh()
  }

  const statusLabel = { draft: es ? 'Borrador' : 'Draft', sent: es ? 'Enviado' : 'Sent', signed: es ? 'Aceptado' : 'Signed', cancelled: es ? 'Cancelado' : 'Cancelled' }[contract.status]
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(es ? `Hola ${quote.client_name}, aquí está el contrato ${contract.number} de imSoft para "${quote.title}". Lo puedes leer y aceptar en línea: ${publicUrl}` : `Hi ${quote.client_name}, here is the contract ${contract.number}: ${publicUrl}`)}`

  return (
    <div className="space-y-6">
      <div className="no-print rounded-lg border bg-muted/40 p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={contract.status === 'signed' ? 'default' : 'secondary'}>{statusLabel}</Badge>
          <code className="text-xs bg-background border rounded px-2 py-1 break-all">{publicUrl}</code>
          <Button size="sm" variant="outline" onClick={async () => { await navigator.clipboard.writeText(publicUrl); toast.success(es ? 'Enlace copiado' : 'Link copied') }}><Copy className="size-4 mr-1" />{es ? 'Copiar enlace' : 'Copy link'}</Button>
          <Button size="sm" variant="outline" asChild><a href={publicUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4 mr-1" />{es ? 'Ver como cliente' : 'View as client'}</a></Button>
          <Button size="sm" variant="outline" onClick={printPage}><Printer className="size-4 mr-1" />PDF</Button>
        </div>
        {!locked && (
          <div className="flex items-center gap-2 flex-wrap">
            {editing ? (
              <Button size="sm" onClick={() => save()} disabled={busy}><Save className="size-4 mr-1" />{es ? 'Guardar texto' : 'Save text'}</Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>{es ? 'Editar cláusulas' : 'Edit clauses'}</Button>
            )}
            {contract.status === 'draft' && <Button size="sm" onClick={() => save({ status: 'sent', sent_at: new Date().toISOString() })} disabled={busy}><Send className="size-4 mr-1" />{es ? 'Marcar como enviado' : 'Mark as sent'}</Button>}
            <Button size="sm" variant="outline" asChild><a href={whatsapp} target="_blank" rel="noopener noreferrer">{es ? 'Enviar por WhatsApp' : 'Send via WhatsApp'}</a></Button>
          </div>
        )}
        {contract.signed_at && <p className="text-xs text-muted-foreground">{es ? 'Aceptado por' : 'Signed by'} {contract.signed_name} · {new Date(contract.signed_at).toLocaleString('es-MX')} · IP {contract.signed_ip}</p>}
        <p className="text-xs text-muted-foreground">{es ? 'Borrador de trabajo generado desde la cotización: conviene que un abogado lo revise antes de usarlo como contrato definitivo.' : 'Working draft generated from the quote: have a lawyer review it before relying on it.'}</p>
      </div>
      {editing ? (
        <Textarea className="border-2! border-border! font-mono text-xs min-h-[480px]" value={html} onChange={(e) => setHtml(e.target.value)} />
      ) : (
        <ContractDocument contract={{ ...contract, body_html: html }} clientName={quote.client_name} clientCompany={quote.client_company} hashCheck={hashCheck} />
      )}
    </div>
  )
}
