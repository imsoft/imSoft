import { describe, expect, it } from 'vitest'
import { contractsForApp, type ContractRow } from './contracts'
import { legacyContract } from './legacy'

const row = (extra: Partial<ContractRow>): ContractRow => ({
  id: 'c1', number: 'CON-2026-001', status: 'sent', token: 'tok', lang: 'es', signed_at: null, signed_name: null,
  quotes: { title: 'Plataforma de avalúos', number: 'COT-2026-001' },
  ...extra,
})

describe('contracts for the app', () => {
  it('a sent contract is awaiting signature and carries its public url', () => {
    expect(contractsForApp([row({})], 'https://www.imsoft.io')).toEqual([{
      id: 'c1', number: 'CON-2026-001', title: 'Plataforma de avalúos', quoteNumber: 'COT-2026-001', status: 'sent',
      signedOn: null, signedBy: null, url: 'https://www.imsoft.io/es/contrato/tok',
    }])
  })

  it('a signed contract has the date (day only) and who signed', () => {
    const [c] = contractsForApp([row({ status: 'signed', signed_at: '2026-10-21T15:04:05.000Z', signed_name: 'Álvaro Gutiérrez', lang: 'en' })], 'https://x')
    expect(c.status).toBe('signed')
    expect(c.signedOn).toBe('2026-10-21')
    expect(c.signedBy).toBe('Álvaro Gutiérrez')
    expect(c.url).toBe('https://x/en/contrato/tok')
    expect(legacyContract(c)).toEqual({
      id: 'c1', folio: 'CON-2026-001', titulo: 'Plataforma de avalúos', cotizacion: 'COT-2026-001', estado: 'firmado',
      fechaFirma: '2026-10-21', firmadoPor: 'Álvaro Gutiérrez', enlace: 'https://x/en/contrato/tok',
    })
  })

  it('drafts and cancelled ones are left out; no linked quote does not break', () => {
    const list = contractsForApp([
      row({ id: 'd', status: 'draft' }),
      row({ id: 'x', status: 'cancelled' }),
      row({ id: 's', quotes: null }),
    ], 'https://x')
    expect(list.map((c) => c.id)).toEqual(['s'])
    expect(list[0].title).toBe('')
  })
})
