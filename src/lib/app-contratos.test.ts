import { describe, expect, it } from 'vitest'
import { contratosParaApp, type FilaContrato } from './app-contratos'

const fila = (extra: Partial<FilaContrato>): FilaContrato => ({
  id: 'c1', folio: 'CON-2026-001', status: 'sent', token: 'tok', lang: 'es', signed_at: null, signed_name: null,
  quotes: { title: 'Plataforma de avalúos', folio: 'COT-2026-001' },
  ...extra,
})

describe('contratos para la app', () => {
  it('un contrato enviado sale pendiente de firma con su enlace público', () => {
    expect(contratosParaApp([fila({})], 'https://www.imsoft.io')).toEqual([{
      id: 'c1', folio: 'CON-2026-001', titulo: 'Plataforma de avalúos', cotizacion: 'COT-2026-001', estado: 'enviado',
      fechaFirma: null, firmadoPor: null, enlace: 'https://www.imsoft.io/es/contrato/tok',
    }])
  })

  it('un contrato firmado trae fecha (solo el día) y quién firmó', () => {
    const [c] = contratosParaApp([fila({ status: 'signed', signed_at: '2026-10-21T15:04:05.000Z', signed_name: 'Álvaro Gutiérrez', lang: 'en' })], 'https://x')
    expect(c.estado).toBe('firmado')
    expect(c.fechaFirma).toBe('2026-10-21')
    expect(c.firmadoPor).toBe('Álvaro Gutiérrez')
    expect(c.enlace).toBe('https://x/en/contrato/tok')
  })

  it('borradores y cancelados no salen; sin cotización ligada no truena', () => {
    const lista = contratosParaApp([
      fila({ id: 'd', status: 'draft' }),
      fila({ id: 'x', status: 'cancelled' }),
      fila({ id: 's', quotes: null }),
    ], 'https://x')
    expect(lista.map((c) => c.id)).toEqual(['s'])
    expect(lista[0].titulo).toBe('')
  })
})
