'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Copy, CreditCard, ExternalLink, Loader2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { NumberInput } from '@/components/ui/number-input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { comisionStripe, montoConRecargo, netoTrasStripe, recargoQueCubreStripe, validarCobro } from '@/lib/cobro-tarjeta'
import { mxn } from '@/lib/cotizaciones'

/** Genera un enlace de pago de Stripe desde la cotizacion: monto libre + recargo opcional. */
export function CardPaymentDialog({ quoteId, folio, clientName, lang, msiDefault, montoSugerido }: { quoteId: string; folio: string; clientName: string; lang: string; msiDefault: boolean; montoSugerido: number }) {
  const es = lang !== 'en'
  const [abierto, setAbierto] = useState(false)
  const [monto, setMonto] = useState(montoSugerido)
  const [recargo, setRecargo] = useState(0)
  const [etiqueta, setEtiqueta] = useState(es ? 'Anticipo' : 'Deposit')
  const [msi, setMsi] = useState(msiDefault)
  const [ocupado, setOcupado] = useState(false)
  const [url, setUrl] = useState<string | null>(null)

  const cobro = useMemo(() => montoConRecargo(monto, recargo), [monto, recargo])
  const minimo = useMemo(() => recargoQueCubreStripe(monto), [monto])
  const error = validarCobro(monto, recargo)

  async function generar() {
    if (error) return toast.error(error)
    setOcupado(true)
    try {
      const r = await fetch(`/api/quotes/${quoteId}/payment-link`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ monto, recargoPct: recargo, etiqueta, msi }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      setUrl(j.url)
      toast.success(es ? 'Enlace de pago listo' : 'Payment link ready')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setOcupado(false)
    }
  }

  const copiar = async () => { if (url) { await navigator.clipboard.writeText(url); toast.success(es ? 'Enlace copiado' : 'Link copied') } }
  const whatsapp = url ? `https://wa.me/?text=${encodeURIComponent(es ? `Hola ${clientName}, aquí está el enlace para pagar con tarjeta ${mxn(cobro)} (${etiqueta}, cotización ${folio}): ${url}` : `Hi ${clientName}, here is the card payment link for ${mxn(cobro)} (${etiqueta}, quote ${folio}): ${url}`)}` : '#'

  return (
    <>
      <Button size="sm" variant="outline" className="h-9" onClick={() => { setUrl(null); setAbierto(true) }}><CreditCard className="size-4 mr-1.5" />{es ? 'Cobrar con tarjeta' : 'Charge by card'}</Button>
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{es ? 'Enlace de pago con tarjeta' : 'Card payment link'} · {folio}</DialogTitle>
            <DialogDescription>{es ? 'Stripe cobra 3.6 % + $3 más IVA. El enlace es de imsoft.io, sirve para un solo pago y no caduca.' : 'Stripe charges 3.6% + $3 plus VAT. The imsoft.io link works for a single payment and does not expire.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <div className="space-y-1.5">
                <Label htmlFor="cp-monto">{es ? 'Monto a cubrir (MXN)' : 'Amount to cover (MXN)'}</Label>
                <NumberInput id="cp-monto" value={monto} onValueChange={(v) => { setMonto(v); setUrl(null) }} placeholder="33234" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-recargo">{es ? 'Recargo %' : 'Surcharge %'}</Label>
                <NumberInput id="cp-recargo" value={recargo} onValueChange={(v) => { setRecargo(v); setUrl(null) }} placeholder="0" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[0, minimo, 5].map((p, i) => (
                <Button key={i} type="button" size="sm" variant={recargo === p ? 'default' : 'outline'} onClick={() => { setRecargo(p); setUrl(null) }}>
                  {i === 0 ? (es ? 'Sin recargo' : 'No surcharge') : i === 1 ? (es ? `Cubrir Stripe (${p} %)` : `Cover Stripe (${p}%)`) : '5 %'}
                </Button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-etiqueta">{es ? 'Concepto (lo ve el cliente al pagar)' : 'Concept (shown at checkout)'}</Label>
              <Input id="cp-etiqueta" value={etiqueta} onChange={(e) => { setEtiqueta(e.target.value); setUrl(null) }} placeholder={es ? 'Anticipo, mensualidad 1 de 3…' : 'Deposit, installment 1 of 3…'} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="cp-msi">{es ? 'Permitir meses sin intereses' : 'Allow interest-free installments'}</Label>
              <Switch id="cp-msi" checked={msi} onCheckedChange={(v) => { setMsi(v); setUrl(null) }} />
            </div>

            {!error && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
                <div className="flex justify-between font-semibold"><span>{es ? 'El cliente paga' : 'Client pays'}</span><span className="font-mono tabular-nums">{mxn(cobro)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>{es ? 'Comisión de Stripe (con IVA)' : 'Stripe fee (incl. VAT)'}</span><span className="font-mono tabular-nums">−{mxn(comisionStripe(cobro))}</span></div>
                <div className="flex justify-between"><span>{es ? 'Te llega' : 'You receive'}</span><span className={`font-mono tabular-nums ${netoTrasStripe(cobro) < monto ? 'text-amber-600' : 'text-emerald-700'}`}>{mxn(netoTrasStripe(cobro))}</span></div>
                {msi ? (
                  <div className="space-y-1 border-t pt-2 text-xs">
                    <p className="text-muted-foreground">{es ? 'Si el cliente elige meses sin intereses, Stripe cobra además el plazo. Te llegaría:' : 'If the client picks installments, Stripe charges extra. You would receive:'}</p>
                    {([3, 6, 12] as const).map((m) => (
                      <div key={m} className="flex justify-between"><span>{m} {es ? 'meses' : 'months'}</span><span className={`font-mono tabular-nums ${netoTrasStripe(cobro, m) < monto ? 'text-amber-600' : 'text-emerald-700'}`}>{mxn(netoTrasStripe(cobro, m))}</span></div>
                    ))}
                    <p className="text-muted-foreground">{es ? 'Stripe ofrece todos los plazos que tengas activos en su Dashboard.' : 'Stripe offers every plan enabled in its Dashboard.'}</p>
                  </div>
                ) : (
                  <p className="border-t pt-2 text-xs text-muted-foreground">{es ? 'Sin meses sin intereses: el cliente solo verá pago en una exhibición.' : 'No installments: the client will only see a single payment.'}</p>
                )}
              </div>
            )}
            {error && monto > 0 && <p className="text-xs text-destructive">{error}</p>}

            {url ? (
              <div className="space-y-2">
                <div className="flex h-9 items-stretch overflow-hidden rounded-md border bg-background">
                  <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 bg-transparent px-3 font-mono text-xs outline-none" />
                  <button type="button" onClick={copiar} className="flex items-center gap-1.5 border-l px-3 text-xs font-medium text-primary hover:bg-accent"><Copy className="size-3.5" />{es ? 'Copiar' : 'Copy'}</button>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild><a href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4 mr-1.5" />WhatsApp</a></Button>
                  <Button size="sm" variant="outline" asChild><a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4 mr-1.5" />{es ? 'Abrir' : 'Open'}</a></Button>
                </div>
              </div>
            ) : (
              <Button className="w-full" onClick={generar} disabled={ocupado || Boolean(error)}>
                {ocupado ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <CreditCard className="size-4 mr-1.5" />}
                {es ? `Generar enlace por ${error ? '…' : mxn(cobro)}` : `Create link for ${error ? '…' : mxn(cobro)}`}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
