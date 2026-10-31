'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NumberInput } from '@/components/ui/number-input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  METHODS,
  INSTALLMENT_EXTRA,
  STRIPE_PCT,
  configFromStorage,
  methodLabel,
  milestoneNames,
  priceForNet,
  simulate,
  type Config,
  type Method,
  type Milestones,
} from '@/lib/fee-simulator'

/** localStorage key: stored in admins' browsers, so its value stays as is. */
const STORAGE_KEY = 'imsoft-simulador'
const DEFAULTS: Config = { price: 18000, method: '6', milestones: '2', chargeVat: true, corporateClient: false, monthlyIncome: 40000, vatOnFee: false }

const mxn = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Math.round(n))
const pct = (n: number) => `${(n * 100).toFixed((n * 100) % 1 ? 2 : 0)} %`

function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: Array<[T, string]>; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map(([v, t]) => (
        <Button key={v} type="button" size="sm" variant={v === value ? 'default' : 'outline'} aria-pressed={v === value} onClick={() => onChange(v)}>
          {t}
        </Button>
      ))}
    </div>
  )
}

export function FeeSimulator({ lang }: { lang: string }) {
  const es = lang !== 'en'
  const [cfg, setCfg] = useState<Config>(DEFAULTS)
  const [net, setNet] = useState(18000)
  const set = <K extends keyof Config>(k: K, v: Config[K]) => setCfg((c) => ({ ...c, [k]: v }))

  // Read after the first render (not in the initializer) so the server and client HTML
  // match; the timeout avoids a synchronous setState inside the effect.
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
        // Settings saved before the English rename use Spanish keys (precio, metodo, neto...).
        if (s?.cfg) setCfg(configFromStorage(s.cfg, DEFAULTS))
        const savedNet = s?.net ?? s?.neto
        if (typeof savedNet === 'number') setNet(savedNet)
      } catch {}
    }, 0)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ cfg, net })) } catch {}
  }, [cfg, net])

  const r = simulate(cfg)
  const names = milestoneNames(cfg.milestones, lang)
  const extra = INSTALLMENT_EXTRA[cfg.method]
  const showMonthly = extra !== null && extra > 0
  const showWithholdings = cfg.corporateClient && cfg.method === 'transfer'
  const transferBaseline = simulate(cfg, 'transfer')
  const num = 'text-right font-mono tabular-nums'

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr] items-start">
      <Card>
        <CardHeader><CardTitle className="text-base">{es ? 'Cotización' : 'Quote'}</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="sim-price">{es ? 'Precio del proyecto (sin IVA)' : 'Project price (before VAT)'}</Label>
            <NumberInput className="border-2! border-border!" id="sim-price" value={cfg.price} onValueChange={(n) => set('price', n)} />
          </div>
          <div className="space-y-1.5">
            <Label>{es ? 'Forma de pago' : 'Payment method'}</Label>
            <Seg<Method> label={es ? 'Forma de pago' : 'Payment method'} value={cfg.method} onChange={(v) => set('method', v)}
              options={[['transfer', es ? 'Transferencia' : 'Transfer'], ['card', es ? 'Tarjeta 1 pago' : 'Card, 1 payment'], ['3', '3 MSI'], ['6', '6 MSI'], ['12', '12 MSI']]} />
          </div>
          <div className="space-y-1.5">
            <Label>{es ? 'Hitos de cobro' : 'Milestones'}</Label>
            <Seg<Milestones> label={es ? 'Hitos' : 'Milestones'} value={cfg.milestones} onChange={(v) => set('milestones', v)}
              options={[['1', es ? '1 pago' : '1 payment'], ['2', '50 / 50'], ['3', '40 / 30 / 30']]} />
            <p className="text-xs text-muted-foreground">{es ? 'Cada hito es un enlace de Stripe y una comisión fija de $3.' : 'Each milestone is one Stripe link and a $3 fixed fee.'}</p>
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="sim-vat">{es ? 'Cobro IVA (16 %)' : 'Charge VAT (16 %)'}</Label>
              <Switch className="border-2! border-border! data-[state=unchecked]:bg-muted!" id="sim-vat" checked={cfg.chargeVat} onCheckedChange={(v) => set('chargeVat', v)} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="sim-corporate" className="leading-snug">{es ? 'Cliente persona moral que paga por transferencia (retiene 1.25 % ISR y ⅔ del IVA)' : 'Corporate client paying by transfer (withholds 1.25 % ISR and ⅔ VAT)'}</Label>
              <Switch className="border-2! border-border! data-[state=unchecked]:bg-muted!" id="sim-corporate" checked={cfg.corporateClient} onCheckedChange={(v) => set('corporateClient', v)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sim-income">{es ? 'Tus ingresos del mes, sin IVA' : 'Your monthly income, before VAT'}</Label>
              <NumberInput className="border-2! border-border!" id="sim-income" value={cfg.monthlyIncome} onValueChange={(n) => set('monthlyIncome', n)} />
              <p className="text-xs text-muted-foreground">{es ? 'Tasa ISR RESICO' : 'RESICO income tax rate'}: {pct(r.rate)}</p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="sim-vat-fee" className="leading-snug">{es ? 'Stripe cobra IVA sobre su comisión (confírmalo en tu primera factura)' : 'Stripe charges VAT on its fee (check your first invoice)'}</Label>
              <Switch className="border-2! border-border! data-[state=unchecked]:bg-muted!" id="sim-vat-fee" checked={cfg.vatOnFee} onCheckedChange={(v) => set('vatOnFee', v)} />
            </div>
          </div>

          <div className="space-y-1.5 border-t pt-4">
            <Label htmlFor="sim-net">{es ? 'Al revés: quiero que me caigan, después de Stripe' : 'Reverse: I want to receive, after Stripe'}</Label>
            <NumberInput className="border-2! border-border!" id="sim-net" value={net} onValueChange={setNet} />
            <p className="text-sm">
              {es ? 'Cotiza ' : 'Quote '}<span className="font-mono font-semibold text-primary text-lg">{mxn(priceForNet(net, cfg))}</span>
              <span className="text-muted-foreground"> {es ? 'sin IVA, redondeado a la centena' : 'before VAT, rounded up'}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [es ? 'Paga el cliente' : 'Client pays', mxn(r.charge), cfg.chargeVat ? `${mxn(cfg.price)} + IVA ${mxn(r.vat)}` : es ? 'sin IVA' : 'no VAT', 'border-primary'],
            [es ? 'Se queda Stripe' : 'Stripe keeps', mxn(r.fee), extra === null ? (es ? 'la transferencia no cuesta' : 'transfers are free') : `${pct(STRIPE_PCT + extra)} + $3 ${es ? 'por hito' : 'per milestone'}`, ''],
            [es ? 'Va al SAT' : 'Goes to SAT', mxn(r.vatDue + r.isrDue), 'IVA + ISR RESICO', ''],
            [es ? 'Te queda a ti' : 'You keep', mxn(r.net), `${pct(cfg.price ? r.net / cfg.price : 0)} ${es ? 'de lo cotizado' : 'of the quote'}`, 'border-green-600 text-green-700 dark:text-green-400'],
          ].map(([k, v, s, cls]) => (
            <Card key={k} className={cls}>
              <CardContent className="pt-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{k}</p>
                <p className="text-2xl font-mono font-semibold tabular-nums mt-1">{v}</p>
                <p className="text-xs text-muted-foreground mt-1">{s}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">{es ? 'Desglose por hito' : 'Per milestone'} · {methodLabel(cfg.method, lang)}</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr className="border-b">
                  <th className="text-left py-2">{es ? 'Hito' : 'Milestone'}</th><th className={num}>Base</th><th className={num}>IVA</th><th className={num}>{es ? 'Paga el cliente' : 'Client pays'}</th>
                  {showMonthly && <th className={num}>{es ? 'Mensualidad' : 'Monthly'}</th>}
                  <th className={num}>Stripe</th>{showWithholdings && <th className={num}>{es ? 'Retenciones' : 'Withholdings'}</th>}<th className={num}>{es ? 'Te cae hoy' : 'You get now'}</th>
                </tr>
              </thead>
              <tbody>
                {r.parts.map((p, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">{names[i]}</td><td className={num}>{mxn(p.base)}</td><td className={num}>{mxn(p.vat)}</td><td className={num}>{mxn(p.charge)}</td>
                    {showMonthly && <td className={num}>{cfg.method} × {mxn(p.monthlyPayment ?? 0)}</td>}
                    <td className={`${num} text-amber-700 dark:text-amber-400`}>−{mxn(p.fee)}</td>
                    {showWithholdings && <td className={`${num} text-amber-700 dark:text-amber-400`}>−{mxn(p.withheldIsr + p.withheldVat)}</td>}
                    <td className={`${num} text-green-700 dark:text-green-400 font-semibold`}>{mxn(p.received)}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="py-2">Total</td><td className={num}>{mxn(cfg.price)}</td><td className={num}>{mxn(r.vat)}</td><td className={num}>{mxn(r.charge)}</td>
                  {showMonthly && <td />}<td className={num}>−{mxn(r.fee)}</td>{showWithholdings && <td className={num}>−{mxn(r.withheldIsr + r.withheldVat)}</td>}<td className={num}>{mxn(r.received)}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-muted-foreground mt-3">
              {es
                ? `Del efectivo recibido entregas al SAT ${mxn(r.vatDue)} de IVA y pagas ${mxn(r.isrDue)} de ISR RESICO (${pct(r.rate)} de ${mxn(cfg.price)}${r.withheldIsr ? `, menos ${mxn(r.withheldIsr)} retenidos` : ''}). Te queda ${mxn(r.net)}.${cfg.corporateClient && cfg.method !== 'transfer' ? ' Como el pago es con tarjeta, el cliente no retiene nada.' : ''}`
                : `From the cash received you pay SAT ${mxn(r.vatDue)} of VAT and ${mxn(r.isrDue)} of RESICO income tax. You keep ${mxn(r.net)}.`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{es ? 'Comparativa de formas de pago, proyecto completo' : 'Payment methods compared, whole project'}</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr className="border-b"><th className="text-left py-2">{es ? 'Forma de pago' : 'Method'}</th><th className={num}>{es ? 'Paga el cliente' : 'Client pays'}</th><th className={num}>Stripe</th><th className={num}>{es ? 'Te cae hoy' : 'You get now'}</th><th className={num}>{es ? 'Te queda' : 'You keep'}</th><th className={num}>{es ? 'vs transferencia' : 'vs transfer'}</th></tr>
              </thead>
              <tbody>
                {METHODS.map((m) => {
                  const x = simulate(cfg, m)
                  const diff = transferBaseline.net - x.net
                  return (
                    <tr key={m} className={`border-b ${m === cfg.method ? 'bg-primary/10 font-semibold' : ''}`}>
                      <td className="py-2">{methodLabel(m, lang)}</td><td className={num}>{mxn(x.charge)}</td><td className={`${num} text-amber-700 dark:text-amber-400`}>{x.fee ? `−${mxn(x.fee)}` : '—'}</td><td className={num}>{mxn(x.received)}</td><td className={`${num} text-green-700 dark:text-green-400`}>{mxn(x.net)}</td><td className={num}>{diff > 0.5 ? `−${mxn(diff)}` : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <ul className="text-xs text-muted-foreground mt-3 space-y-1 list-disc pl-4">
              <li>{es ? 'Stripe México: 3.6 % + $3 por cargo; MSI +5 % (3), +7.5 % (6), +12.5 % (12), sobre el total con IVA.' : 'Stripe Mexico: 3.6 % + $3 per charge; installments +5 % (3), +7.5 % (6), +12.5 % (12), on the VAT-inclusive total.'}</li>
              <li>{es ? 'RESICO persona física: ISR por tramo mensual (1 % a 2.5 %), sin deducciones: la comisión de Stripe no baja tu ISR.' : 'RESICO: income tax by monthly bracket (1 % to 2.5 %), no deductions.'}</li>
              <li>{es ? 'Estimación para cotizar. Confírmalo con tu contador antes de declarar.' : 'Estimate for quoting. Confirm with your accountant before filing.'}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
