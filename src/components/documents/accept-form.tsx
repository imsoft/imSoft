'use client'

import { useState } from 'react'
import { lanzar } from './confetti'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SignaturePad } from './signature-pad'

/**
 * Aceptacion en linea: nombre + casilla y, en contratos, firma dibujada. La evidencia
 * (fecha, IP, navegador, huella del texto) la guarda el servidor.
 */
export interface OpcionPagoUI { clave: string; titulo: string; resumen: string }

export function AcceptForm({ endpoint, tipo, lang, opciones = [] }: { endpoint: string; tipo: 'cotizacion' | 'contrato'; lang: string; opciones?: OpcionPagoUI[] }) {
  const es = lang !== 'en'
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [formaDePago, setFormaDePago] = useState<string>(opciones[0]?.clave ?? '')
  const [acepta, setAcepta] = useState(false)
  const [firma, setFirma] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hecho, setHecho] = useState(false)
  const pideFirma = tipo === 'contrato'

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true); setError(null)
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre, acepta, ...(pideFirma ? { firma } : {}), ...(opciones.length ? { formaDePago } : {}) }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || (es ? 'No se pudo registrar la aceptación.' : 'Could not record acceptance.'))
      setHecho(true)
      import('canvas-confetti').then((m) => lanzar(m.default)).catch(() => {})
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setEnviando(false)
    }
  }

  if (hecho) {
    return (
      <div className="no-print mx-auto max-w-3xl rounded-xl border border-emerald-300 bg-emerald-50 p-6 text-emerald-900">
        <p className="font-semibold">{tipo === 'contrato' ? (es ? '¡Listo! Quedó firmado.' : 'Done! Signed.') : (es ? '¡Listo! Quedó aceptada.' : 'Done! Accepted.')}</p>
        <p className="text-sm mt-1">{es ? 'Te escribiremos en breve para el siguiente paso. Puedes imprimir o guardar esta página como comprobante.' : 'We will contact you shortly with the next step. You can print or save this page as proof.'}</p>
      </div>
    )
  }

  const listo = acepta && nombre.trim().length >= 3 && (!pideFirma || firma !== null) && (opciones.length === 0 || Boolean(formaDePago))

  return (
    <form onSubmit={enviar} className="no-print mx-auto max-w-3xl rounded-xl border bg-white p-6 text-neutral-900 space-y-4">
      <h2 className="text-lg font-semibold">{tipo === 'cotizacion' ? (es ? 'Aceptar esta cotización' : 'Accept this quote') : (es ? 'Firmar este contrato' : 'Sign this contract')}</h2>
      <div className="space-y-1.5">
        <label htmlFor="acc-nombre" className="text-sm font-medium">{es ? 'Tu nombre completo' : 'Your full name'}</label>
        <Input id="acc-nombre" className="border-2! border-neutral-300! bg-white text-neutral-900" value={nombre} onChange={(e) => setNombre(e.target.value)} required minLength={3} autoComplete="name" />
      </div>
      {opciones.length > 1 && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">{es ? '¿Cómo prefieres pagar?' : 'How do you prefer to pay?'}</legend>
          {opciones.map((o) => (
            <label key={o.clave} className={`flex items-start gap-3 rounded-lg border-2 p-3 cursor-pointer ${formaDePago === o.clave ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200'}`}>
              <input type="radio" name="forma-de-pago" className="mt-1" value={o.clave} checked={formaDePago === o.clave} onChange={() => setFormaDePago(o.clave)} />
              <span><span className="block font-medium">{o.titulo}</span><span className="block text-sm text-neutral-600">{o.resumen}</span></span>
            </label>
          ))}
        </fieldset>
      )}
      {pideFirma && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">{es ? 'Tu firma' : 'Your signature'}</p>
          <SignaturePad onChange={setFirma} lang={lang} />
        </div>
      )}
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} required />
        <span>{tipo === 'cotizacion'
          ? (es ? 'He leído la cotización y acepto sus condiciones, precio y forma de pago.' : 'I have read the quote and accept its terms, price and payment schedule.')
          : (es ? 'He leído el contrato completo y lo acepto en todos sus términos.' : 'I have read the full contract and accept all of its terms.')}</span>
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <Button type="submit" disabled={enviando || !listo}>{enviando ? (es ? 'Enviando…' : 'Sending…') : pideFirma ? (es ? 'Firmar y aceptar' : 'Sign and accept') : (es ? 'Aceptar' : 'Accept')}</Button>
      <p className="text-xs text-neutral-500">{pideFirma
        ? (es ? 'Al firmar se registran tu nombre, tu firma, la fecha y hora, la dirección desde la que lo haces y una huella digital del texto aceptado, como constancia de conformidad.' : 'On signing we record your name, your signature, date and time, the address you sign from, and a digital fingerprint of the accepted text, as proof of consent.')
        : (es ? 'Al aceptar se registran tu nombre, la fecha y hora, y la dirección desde la que lo haces, como constancia de conformidad.' : 'On acceptance we record your name, date and time, and the address you accept from, as proof of consent.')}</p>
    </form>
  )
}
