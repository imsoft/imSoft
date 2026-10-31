'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Copy, CreditCard, ExternalLink, Loader2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { netAfterStripe, stripeFee, surchargeToCoverStripe, validateCharge, withSurcharge } from '@/lib/card-charge'
import { formatMoney } from '@/lib/quotes'
import { TERMS, type Term } from '@/lib/payment-link-token'
import { termLabel } from '@/lib/pay-term'

/**
 * Creates a card payment link from the quote: free amount, surcharge and a fixed term.
 * The client pays on imsoft.io only with the term chosen here.
 */
export function CardPaymentDialog({ quoteId, number, clientName, lang, installmentsByDefault, suggestedAmount }: { quoteId: string; number: string; clientName: string; lang: string; installmentsByDefault: boolean; suggestedAmount: number }) {
  const es = lang !== 'en'
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(suggestedAmount)
  const [surcharge, setSurcharge] = useState(0)
  const [label, setLabel] = useState(es ? 'Anticipo' : 'Deposit')
  const [term, setTerm] = useState<Term>(installmentsByDefault ? 6 : 0)
  const [busy, setBusy] = useState(false)
  const [url, setUrl] = useState<string | null>(null)

  const charge = useMemo(() => withSurcharge(amount, surcharge), [amount, surcharge])
  const minimum = useMemo(() => surchargeToCoverStripe(amount, term), [amount, term])
  const error = validateCharge(amount, surcharge)

  async function generate() {
    if (error) return toast.error(error)
    setBusy(true)
    try {
      const r = await fetch(`/api/quotes/${quoteId}/payment-link`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, surchargePct: surcharge, label, term }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      setUrl(j.url)
      toast.success(es ? 'Enlace de pago listo' : 'Payment link ready')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => { if (url) { await navigator.clipboard.writeText(url); toast.success(es ? 'Enlace copiado' : 'Link copied') } }
  const termText = term ? (es ? ` a ${term} meses sin intereses (${term} pagos de ${formatMoney(charge / term)})` : ` in ${term} interest-free months (${term} payments of ${formatMoney(charge / term)})`) : ''
  const whatsapp = url ? `https://wa.me/?text=${encodeURIComponent(es ? `Hola ${clientName}, aquí está el enlace para pagar con tarjeta ${formatMoney(charge)}${termText} (${label}, cotización ${number}): ${url}` : `Hi ${clientName}, here is the card payment link for ${formatMoney(charge)}${termText} (${label}, quote ${number}): ${url}`)}` : '#'

  return (
    <>
      <Button size="sm" variant="outline" className="h-9" onClick={() => { setUrl(null); setOpen(true) }}><CreditCard className="size-4 mr-1.5" />{es ? 'Cobrar con tarjeta' : 'Charge by card'}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{es ? 'Enlace de pago con tarjeta' : 'Card payment link'} · {number}</DialogTitle>
            <DialogDescription>{es ? 'Stripe cobra 3.6 % + $3 más IVA, y 5 %, 7.5 % o 12.5 % extra a 3, 6 o 12 meses. El enlace es de imsoft.io, sirve para un solo pago, no caduca y solo acepta el plazo que elijas aquí.' : 'Stripe charges 3.6% + $3 plus VAT, and 5%, 7.5% or 12.5% extra for 3, 6 or 12 months. The imsoft.io link works for a single payment, does not expire and only accepts the plan you pick here.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <div className="space-y-1.5">
                <Label htmlFor="cp-amount">{es ? 'Monto a cubrir (MXN)' : 'Amount to cover (MXN)'}</Label>
                <NumberInput id="cp-amount" value={amount} onValueChange={(v) => { setAmount(v); setUrl(null) }} placeholder="33234" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-surcharge">{es ? 'Recargo %' : 'Surcharge %'}</Label>
                <NumberInput id="cp-surcharge" value={surcharge} onValueChange={(v) => { setSurcharge(v); setUrl(null) }} placeholder="0" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[0, minimum, 5].map((p, i) => (
                <Button key={i} type="button" size="sm" variant={surcharge === p ? 'default' : 'outline'} onClick={() => { setSurcharge(p); setUrl(null) }}>
                  {i === 0 ? (es ? 'Sin recargo' : 'No surcharge') : i === 1 ? (es ? `Cubrir Stripe (${p} %)` : `Cover Stripe (${p}%)`) : '5 %'}
                </Button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-label">{es ? 'Concepto (lo ve el cliente al pagar)' : 'Concept (shown at checkout)'}</Label>
              <Input id="cp-label" value={label} onChange={(e) => { setLabel(e.target.value); setUrl(null) }} placeholder={es ? 'Anticipo, mensualidad 1 de 3…' : 'Deposit, installment 1 of 3…'} />
            </div>
            <div className="space-y-1.5">
              <Label>{es ? 'Plazo que acepta el enlace' : 'Plan the link accepts'}</Label>
              <div className="flex flex-wrap gap-2">
                {TERMS.map((p) => (
                  <Button key={p} type="button" size="sm" variant={term === p ? 'default' : 'outline'} onClick={() => { setTerm(p); setUrl(null) }}>
                    {p ? `${p} MSI` : (es ? 'Una exhibición' : 'Single payment')}
                  </Button>
                ))}
              </div>
            </div>

            {!error && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
                <div className="flex justify-between font-semibold"><span>{es ? 'El cliente paga' : 'Client pays'}</span><span className="font-mono tabular-nums">{formatMoney(charge)}</span></div>
                {term > 0 && <div className="flex justify-between text-muted-foreground"><span>{termLabel(term, es)}</span><span className="font-mono tabular-nums">{term} × {formatMoney(charge / term)}</span></div>}
                <div className="flex justify-between text-muted-foreground"><span>{es ? 'Comisión de Stripe (con IVA)' : 'Stripe fee (incl. VAT)'}</span><span className="font-mono tabular-nums">−{formatMoney(stripeFee(charge, term))}</span></div>
                <div className="flex justify-between"><span>{es ? 'Te llega' : 'You receive'}</span><span className={`font-mono tabular-nums ${netAfterStripe(charge, term) < amount ? 'text-amber-600' : 'text-emerald-700'}`}>{formatMoney(netAfterStripe(charge, term))}</span></div>
                <p className="border-t pt-2 text-xs text-muted-foreground">{term ? (es ? `El cliente solo podrá pagar a ${term} meses sin intereses; si su tarjeta no lo admite, se le avisa y no se le cobra.` : `The client can only pay in ${term} interest-free months; if the card does not support it, nothing is charged.`) : (es ? 'El cliente solo verá pago en una exhibición.' : 'The client will only see a single payment.')}</p>
              </div>
            )}
            {error && amount > 0 && <p className="text-xs text-destructive">{error}</p>}

            {url ? (
              <div className="space-y-2">
                <div className="flex h-9 items-stretch overflow-hidden rounded-md border bg-background">
                  <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 bg-transparent px-3 font-mono text-xs outline-none" />
                  <button type="button" onClick={copy} className="flex items-center gap-1.5 border-l px-3 text-xs font-medium text-primary hover:bg-accent"><Copy className="size-3.5" />{es ? 'Copiar' : 'Copy'}</button>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild><a href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4 mr-1.5" />WhatsApp</a></Button>
                  <Button size="sm" variant="outline" asChild><a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4 mr-1.5" />{es ? 'Abrir' : 'Open'}</a></Button>
                </div>
              </div>
            ) : (
              <Button className="w-full" onClick={generate} disabled={busy || Boolean(error)}>
                {busy ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <CreditCard className="size-4 mr-1.5" />}
                {es ? `Generar enlace por ${error ? '…' : formatMoney(charge)}` : `Create link for ${error ? '…' : formatMoney(charge)}`}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
