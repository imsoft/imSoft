'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Copy, CreditCard, ExternalLink, Loader2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { comisionStripe, montoConRecargo, netoTrasStripe, recargoQueCubreStripe, validarCobro } from '@/lib/cobro-tarjeta'
import { mxn } from '@/lib/cotizaciones'
import { PLAZOS, type Plazo } from '@/lib/enlace-pago'
import { etiquetaPlazo } from '@/lib/pagar-plazo'

/**
 * Genera un enlace de pago con tarjeta desde la cotizacion: monto libre, recargo y plazo
 * fijo. El cliente paga en imsoft.io solo con el plazo elegido aqui.
 */
export function CardPaymentDialog({ quoteId, folio, clientName, lang, msiDefault, montoSugerido }: { quoteId: string; folio: string; clientName: string; lang: string; msiDefault: boolean; montoSugerido: number }) {
  const es = lang !== 'en'
  const [abierto, setAbierto] = useState(false)
  const [monto, setMonto] = useState(montoSugerido)
  const [recargo, setRecargo] = useState(0)
  const [etiqueta, setEtiqueta] = useState(es ? 'Anticipo' : 'Deposit')
  const [plazo, setPlazo] = useState<Plazo>(msiDefault ? 6 : 0)
  const [ocupado, setOcupado] = useState(false)
  const [url, setUrl] = useState<string | null>(null)

  const cobro = useMemo(() => montoConRecargo(monto, recargo), [monto, recargo])
  const minimo = useMemo(() => recargoQueCubreStripe(monto, plazo), [monto, plazo])
  const error = validarCobro(monto, recargo)

  async function generar() {
    if (error) return toast.error(error)
    setOcupado(true)
    try {
      const r = await fetch(`/api/quotes/${quoteId}/payment-link`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ monto, recargoPct: recargo, etiqueta, plazo }) })
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
  const plazoTexto = plazo ? (es ? ` a ${plazo} meses sin intereses (${plazo} pagos de ${mxn(cobro / plazo)})` : ` in ${plazo} interest-free months (${plazo} payments of ${mxn(cobro / plazo)})`) : ''
  const whatsapp = url ? `https://wa.me/?text=${encodeURIComponent(es ? `Hola ${clientName}, aquí está el enlace para pagar con tarjeta ${mxn(cobro)}${plazoTexto} (${etiqueta}, cotización ${folio}): ${url}` : `Hi ${clientName}, here is the card payment link for ${mxn(cobro)}${plazoTexto} (${etiqueta}, quote ${folio}): ${url}`)}` : '#'

  return (
    <>
      <Button size="sm" variant="outline" className="h-9" onClick={() => { setUrl(null); setAbierto(true) }}><CreditCard className="size-4 mr-1.5" />{es ? 'Cobrar con tarjeta' : 'Charge by card'}</Button>
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{es ? 'Enlace de pago con tarjeta' : 'Card payment link'} · {folio}</DialogTitle>
            <DialogDescription>{es ? 'Stripe cobra 3.6 % + $3 más IVA, y 5 %, 7.5 % o 12.5 % extra a 3, 6 o 12 meses. El enlace es de imsoft.io, sirve para un solo pago, no caduca y solo acepta el plazo que elijas aquí.' : 'Stripe charges 3.6% + $3 plus VAT, and 5%, 7.5% or 12.5% extra for 3, 6 or 12 months. The imsoft.io link works for a single payment, does not expire and only accepts the plan you pick here.'}</DialogDescription>
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
            <div className="space-y-1.5">
              <Label>{es ? 'Plazo que acepta el enlace' : 'Plan the link accepts'}</Label>
              <div className="flex flex-wrap gap-2">
                {PLAZOS.map((p) => (
                  <Button key={p} type="button" size="sm" variant={plazo === p ? 'default' : 'outline'} onClick={() => { setPlazo(p); setUrl(null) }}>
                    {p ? `${p} MSI` : (es ? 'Una exhibición' : 'Single payment')}
                  </Button>
                ))}
              </div>
            </div>

            {!error && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
                <div className="flex justify-between font-semibold"><span>{es ? 'El cliente paga' : 'Client pays'}</span><span className="font-mono tabular-nums">{mxn(cobro)}</span></div>
                {plazo > 0 && <div className="flex justify-between text-muted-foreground"><span>{etiquetaPlazo(plazo, es)}</span><span className="font-mono tabular-nums">{plazo} × {mxn(cobro / plazo)}</span></div>}
                <div className="flex justify-between text-muted-foreground"><span>{es ? 'Comisión de Stripe (con IVA)' : 'Stripe fee (incl. VAT)'}</span><span className="font-mono tabular-nums">−{mxn(comisionStripe(cobro, plazo))}</span></div>
                <div className="flex justify-between"><span>{es ? 'Te llega' : 'You receive'}</span><span className={`font-mono tabular-nums ${netoTrasStripe(cobro, plazo) < monto ? 'text-amber-600' : 'text-emerald-700'}`}>{mxn(netoTrasStripe(cobro, plazo))}</span></div>
                <p className="border-t pt-2 text-xs text-muted-foreground">{plazo ? (es ? `El cliente solo podrá pagar a ${plazo} meses sin intereses; si su tarjeta no lo admite, se le avisa y no se le cobra.` : `The client can only pay in ${plazo} interest-free months; if the card does not support it, nothing is charged.`) : (es ? 'El cliente solo verá pago en una exhibición.' : 'The client will only see a single payment.')}</p>
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
