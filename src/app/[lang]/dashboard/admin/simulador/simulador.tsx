'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  METODOS,
  MSI_EXTRA,
  STRIPE_PCT,
  calcular,
  etiquetaMetodo,
  nombresHitos,
  precioParaNeto,
  type Config,
  type Hitos,
  type Metodo,
} from '@/lib/simulador-cobros'

const STORAGE = 'imsoft-simulador'
const inicial: Config = { precio: 18000, metodo: '6', hitos: '2', cobraIva: true, clientePersonaMoral: false, ingresoMensual: 40000, ivaSobreComision: false }

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

export function Simulador({ lang }: { lang: string }) {
  const es = lang !== 'en'
  const [cfg, setCfg] = useState<Config>(inicial)
  const [neto, setNeto] = useState(18000)
  const set = <K extends keyof Config>(k: K, v: Config[K]) => setCfg((c) => ({ ...c, [k]: v }))

  // Se lee tras el primer render (no en el inicializador) para que el HTML del servidor
  // y el del cliente coincidan; el timeout evita el setState sincrono dentro del efecto.
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const s = JSON.parse(localStorage.getItem(STORAGE) || 'null')
        if (s?.cfg) setCfg({ ...inicial, ...s.cfg })
        if (typeof s?.neto === 'number') setNeto(s.neto)
      } catch {}
    }, 0)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    try { localStorage.setItem(STORAGE, JSON.stringify({ cfg, neto })) } catch {}
  }, [cfg, neto])

  const r = calcular(cfg)
  const nombres = nombresHitos(cfg.hitos, lang)
  const extra = MSI_EXTRA[cfg.metodo]
  const conMensualidad = extra !== null && extra > 0
  const conRetenciones = cfg.clientePersonaMoral && cfg.metodo === 'transfer'
  const baseTransfer = calcular(cfg, 'transfer')
  const num = 'text-right font-mono tabular-nums'

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr] items-start">
      <Card>
        <CardHeader><CardTitle className="text-base">{es ? 'Cotización' : 'Quote'}</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="sim-precio">{es ? 'Precio del proyecto (sin IVA)' : 'Project price (before VAT)'}</Label>
            <Input className="border-2! border-border!" id="sim-precio" type="number" min={0} step={100} value={cfg.precio} onChange={(e) => set('precio', Number(e.target.value) || 0)} />
          </div>
          <div className="space-y-1.5">
            <Label>{es ? 'Forma de pago' : 'Payment method'}</Label>
            <Seg<Metodo> label={es ? 'Forma de pago' : 'Payment method'} value={cfg.metodo} onChange={(v) => set('metodo', v)}
              options={[['transfer', es ? 'Transferencia' : 'Transfer'], ['card', es ? 'Tarjeta 1 pago' : 'Card, 1 payment'], ['3', '3 MSI'], ['6', '6 MSI'], ['12', '12 MSI']]} />
          </div>
          <div className="space-y-1.5">
            <Label>{es ? 'Hitos de cobro' : 'Milestones'}</Label>
            <Seg<Hitos> label={es ? 'Hitos' : 'Milestones'} value={cfg.hitos} onChange={(v) => set('hitos', v)}
              options={[['1', es ? '1 pago' : '1 payment'], ['2', '50 / 50'], ['3', '40 / 30 / 30']]} />
            <p className="text-xs text-muted-foreground">{es ? 'Cada hito es un enlace de Stripe y una comisión fija de $3.' : 'Each milestone is one Stripe link and a $3 fixed fee.'}</p>
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="sim-iva">{es ? 'Cobro IVA (16 %)' : 'Charge VAT (16 %)'}</Label>
              <Switch id="sim-iva" checked={cfg.cobraIva} onCheckedChange={(v) => set('cobraIva', v)} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="sim-pm" className="leading-snug">{es ? 'Cliente persona moral que paga por transferencia (retiene 1.25 % ISR y ⅔ del IVA)' : 'Corporate client paying by transfer (withholds 1.25 % ISR and ⅔ VAT)'}</Label>
              <Switch id="sim-pm" checked={cfg.clientePersonaMoral} onCheckedChange={(v) => set('clientePersonaMoral', v)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sim-ingreso">{es ? 'Tus ingresos del mes, sin IVA' : 'Your monthly income, before VAT'}</Label>
              <Input className="border-2! border-border!" id="sim-ingreso" type="number" min={0} step={1000} value={cfg.ingresoMensual} onChange={(e) => set('ingresoMensual', Number(e.target.value) || 0)} />
              <p className="text-xs text-muted-foreground">{es ? 'Tasa ISR RESICO' : 'RESICO income tax rate'}: {pct(r.tasa)}</p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="sim-ivafee" className="leading-snug">{es ? 'Stripe cobra IVA sobre su comisión (confírmalo en tu primera factura)' : 'Stripe charges VAT on its fee (check your first invoice)'}</Label>
              <Switch id="sim-ivafee" checked={cfg.ivaSobreComision} onCheckedChange={(v) => set('ivaSobreComision', v)} />
            </div>
          </div>

          <div className="space-y-1.5 border-t pt-4">
            <Label htmlFor="sim-neto">{es ? 'Al revés: quiero que me caigan, después de Stripe' : 'Reverse: I want to receive, after Stripe'}</Label>
            <Input className="border-2! border-border!" id="sim-neto" type="number" min={0} step={100} value={neto} onChange={(e) => setNeto(Number(e.target.value) || 0)} />
            <p className="text-sm">
              {es ? 'Cotiza ' : 'Quote '}<span className="font-mono font-semibold text-primary text-lg">{mxn(precioParaNeto(neto, cfg))}</span>
              <span className="text-muted-foreground"> {es ? 'sin IVA, redondeado a la centena' : 'before VAT, rounded up'}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [es ? 'Paga el cliente' : 'Client pays', mxn(r.cobro), cfg.cobraIva ? `${mxn(cfg.precio)} + IVA ${mxn(r.iva)}` : es ? 'sin IVA' : 'no VAT', 'border-primary'],
            [es ? 'Se queda Stripe' : 'Stripe keeps', mxn(r.fee), extra === null ? (es ? 'la transferencia no cuesta' : 'transfers are free') : `${pct(STRIPE_PCT + extra)} + $3 ${es ? 'por hito' : 'per milestone'}`, ''],
            [es ? 'Va al SAT' : 'Goes to SAT', mxn(r.ivaEnterar + r.isrPagar), 'IVA + ISR RESICO', ''],
            [es ? 'Te queda a ti' : 'You keep', mxn(r.neto), `${pct(cfg.precio ? r.neto / cfg.precio : 0)} ${es ? 'de lo cotizado' : 'of the quote'}`, 'border-green-600 text-green-700 dark:text-green-400'],
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
          <CardHeader><CardTitle className="text-base">{es ? 'Desglose por hito' : 'Per milestone'} · {etiquetaMetodo(cfg.metodo, lang)}</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr className="border-b">
                  <th className="text-left py-2">{es ? 'Hito' : 'Milestone'}</th><th className={num}>Base</th><th className={num}>IVA</th><th className={num}>{es ? 'Paga el cliente' : 'Client pays'}</th>
                  {conMensualidad && <th className={num}>{es ? 'Mensualidad' : 'Monthly'}</th>}
                  <th className={num}>Stripe</th>{conRetenciones && <th className={num}>{es ? 'Retenciones' : 'Withholdings'}</th>}<th className={num}>{es ? 'Te cae hoy' : 'You get now'}</th>
                </tr>
              </thead>
              <tbody>
                {r.partes.map((p, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">{nombres[i]}</td><td className={num}>{mxn(p.base)}</td><td className={num}>{mxn(p.iva)}</td><td className={num}>{mxn(p.cobro)}</td>
                    {conMensualidad && <td className={num}>{cfg.metodo} × {mxn(p.mensualidad ?? 0)}</td>}
                    <td className={`${num} text-amber-700 dark:text-amber-400`}>−{mxn(p.fee)}</td>
                    {conRetenciones && <td className={`${num} text-amber-700 dark:text-amber-400`}>−{mxn(p.retISR + p.retIVA)}</td>}
                    <td className={`${num} text-green-700 dark:text-green-400 font-semibold`}>{mxn(p.cae)}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="py-2">Total</td><td className={num}>{mxn(cfg.precio)}</td><td className={num}>{mxn(r.iva)}</td><td className={num}>{mxn(r.cobro)}</td>
                  {conMensualidad && <td />}<td className={num}>−{mxn(r.fee)}</td>{conRetenciones && <td className={num}>−{mxn(r.retISR + r.retIVA)}</td>}<td className={num}>{mxn(r.cae)}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-muted-foreground mt-3">
              {es
                ? `Del efectivo recibido entregas al SAT ${mxn(r.ivaEnterar)} de IVA y pagas ${mxn(r.isrPagar)} de ISR RESICO (${pct(r.tasa)} de ${mxn(cfg.precio)}${r.retISR ? `, menos ${mxn(r.retISR)} retenidos` : ''}). Te queda ${mxn(r.neto)}.${cfg.clientePersonaMoral && cfg.metodo !== 'transfer' ? ' Como el pago es con tarjeta, el cliente no retiene nada.' : ''}`
                : `From the cash received you pay SAT ${mxn(r.ivaEnterar)} of VAT and ${mxn(r.isrPagar)} of RESICO income tax. You keep ${mxn(r.neto)}.`}
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
                {METODOS.map((m) => {
                  const x = calcular(cfg, m)
                  const dif = baseTransfer.neto - x.neto
                  return (
                    <tr key={m} className={`border-b ${m === cfg.metodo ? 'bg-primary/10 font-semibold' : ''}`}>
                      <td className="py-2">{etiquetaMetodo(m, lang)}</td><td className={num}>{mxn(x.cobro)}</td><td className={`${num} text-amber-700 dark:text-amber-400`}>{x.fee ? `−${mxn(x.fee)}` : '—'}</td><td className={num}>{mxn(x.cae)}</td><td className={`${num} text-green-700 dark:text-green-400`}>{mxn(x.neto)}</td><td className={num}>{dif > 0.5 ? `−${mxn(dif)}` : '—'}</td>
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
