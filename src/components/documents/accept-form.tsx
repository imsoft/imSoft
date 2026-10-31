'use client'

import { useState } from 'react'
import { launch } from './confetti'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SignaturePad } from './signature-pad'

/**
 * Online acceptance: name + checkbox and, for contracts, a drawn signature. The evidence
 * (date, IP, browser, text hash) is stored by the server.
 */
export interface PaymentOptionUI { key: string; title: string; summary: string }

export function AcceptForm({ endpoint, kind, lang, options = [] }: { endpoint: string; kind: 'quote' | 'contract'; lang: string; options?: PaymentOptionUI[] }) {
  const es = lang !== 'en'
  const router = useRouter()
  const [name, setName] = useState('')
  const [paymentOption, setPaymentOption] = useState<string>(options[0]?.key ?? '')
  const [accepted, setAccepted] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const needsSignature = kind === 'contract'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true); setError(null)
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, accepted, ...(needsSignature ? { signature } : {}), ...(options.length ? { paymentOption } : {}) }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || (es ? 'No se pudo registrar la aceptación.' : 'Could not record acceptance.'))
      setDone(true)
      import('canvas-confetti').then((m) => launch(m.default)).catch(() => {})
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSending(false)
    }
  }

  if (done) {
    return (
      <div className="no-print mx-auto max-w-3xl rounded-xl border border-emerald-300 bg-emerald-50 p-6 text-emerald-900">
        <p className="font-semibold">{kind === 'contract' ? (es ? '¡Listo! Quedó firmado.' : 'Done! Signed.') : (es ? '¡Listo! Quedó aceptada.' : 'Done! Accepted.')}</p>
        <p className="text-sm mt-1">{es ? 'Te escribiremos en breve para el siguiente paso. Puedes imprimir o guardar esta página como comprobante.' : 'We will contact you shortly with the next step. You can print or save this page as proof.'}</p>
      </div>
    )
  }

  const ready = accepted && name.trim().length >= 3 && (!needsSignature || signature !== null) && (options.length === 0 || Boolean(paymentOption))

  return (
    <form onSubmit={submit} className="no-print mx-auto max-w-3xl rounded-xl border bg-white p-6 text-neutral-900 space-y-4">
      <h2 className="text-lg font-semibold">{kind === 'quote' ? (es ? 'Aceptar esta cotización' : 'Accept this quote') : (es ? 'Firmar este contrato' : 'Sign this contract')}</h2>
      <div className="space-y-1.5">
        <label htmlFor="acc-name" className="text-sm font-medium">{es ? 'Tu nombre completo' : 'Your full name'}</label>
        <Input id="acc-name" className="border-2! border-neutral-300! bg-white text-neutral-900" value={name} onChange={(e) => setName(e.target.value)} required minLength={3} autoComplete="name" />
      </div>
      {options.length > 1 && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">{es ? '¿Cómo prefieres pagar?' : 'How do you prefer to pay?'}</legend>
          {options.map((o) => (
            <label key={o.key} className={`flex items-start gap-3 rounded-lg border-2 p-3 cursor-pointer ${paymentOption === o.key ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200'}`}>
              <input type="radio" name="payment-option" className="mt-1" value={o.key} checked={paymentOption === o.key} onChange={() => setPaymentOption(o.key)} />
              <span><span className="block font-medium">{o.title}</span><span className="block text-sm text-neutral-600">{o.summary}</span></span>
            </label>
          ))}
        </fieldset>
      )}
      {needsSignature && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">{es ? 'Tu firma' : 'Your signature'}</p>
          <SignaturePad onChange={setSignature} lang={lang} />
        </div>
      )}
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} required />
        <span>{kind === 'quote'
          ? (es ? 'He leído la cotización y acepto sus condiciones, precio y forma de pago.' : 'I have read the quote and accept its terms, price and payment schedule.')
          : (es ? 'He leído el contrato completo y lo acepto en todos sus términos.' : 'I have read the full contract and accept all of its terms.')}</span>
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <Button type="submit" disabled={sending || !ready}>{sending ? (es ? 'Enviando…' : 'Sending…') : needsSignature ? (es ? 'Firmar y aceptar' : 'Sign and accept') : (es ? 'Aceptar' : 'Accept')}</Button>
      <p className="text-xs text-neutral-500">{needsSignature
        ? (es ? 'Al firmar se registran tu nombre, tu firma, la fecha y hora, la dirección desde la que lo haces y una huella digital del texto aceptado, como constancia de conformidad.' : 'On signing we record your name, your signature, date and time, the address you sign from, and a digital fingerprint of the accepted text, as proof of consent.')
        : (es ? 'Al aceptar se registran tu nombre, la fecha y hora, y la dirección desde la que lo haces, como constancia de conformidad.' : 'On acceptance we record your name, date and time, and the address you accept from, as proof of consent.')}</p>
    </form>
  )
}
