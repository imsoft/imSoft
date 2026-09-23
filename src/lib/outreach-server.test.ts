import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/gmail/server', () => ({ enviarRaw: vi.fn(), hiloTieneRespuesta: vi.fn(), messageIdHeader: vi.fn() }))
vi.mock('@anthropic-ai/sdk', () => ({ default: class {} }))

import { marcarEnviadoAMano } from './outreach-server'

/**
 * Supabase falso: guarda que se actualizo/inserto en cada tabla y devuelve el borrador
 * pedido. Con esto se prueba el efecto de "Ya lo envie" sin base de datos.
 */
function dbFalso(borrador: Record<string, unknown> | null) {
  const updates: Array<{ tabla: string; valores: Record<string, unknown>; filtros: Record<string, unknown> }> = []
  const inserts: Array<{ tabla: string; valores: Record<string, unknown> }> = []
  const from = (tabla: string) => {
    const filtros: Record<string, unknown> = {}
    const q: Record<string, unknown> = {
      select: () => q,
      eq: (col: string, val: unknown) => { filtros[col] = val; return q },
      maybeSingle: async () => ({ data: tabla === 'outreach_emails' ? borrador : null }),
      update: (valores: Record<string, unknown>) => { updates.push({ tabla, valores, filtros }); return q },
      insert: async (valores: Record<string, unknown>) => { inserts.push({ tabla, valores }); return { error: null } },
      then: (ok: (v: unknown) => void) => ok({ error: null }),
    }
    return q
  }
  return { db: { from } as never, updates, inserts }
}

describe('marcarEnviadoAMano', () => {
  const borrador = { id: 'b1', contact_id: 'c1', step: 1, status: 'draft', subject: 'Hola', html: '<p>Hola</p>' }

  it('marca el borrador como enviado a mano, lo registra en el CRM y pasa al prospecto a calificacion', async () => {
    const { db, updates, inserts } = dbFalso(borrador)
    const r = await marcarEnviadoAMano(db, 'u1', 'b1')

    const correo = updates.find((u) => u.tabla === 'outreach_emails')!
    expect(correo.valores).toMatchObject({ status: 'sent', sent_via: 'manual' })
    expect(correo.valores.sent_at).toBeTruthy()
    expect(correo.filtros).toEqual({ id: 'b1' })

    expect(inserts).toEqual([{ tabla: 'contact_emails', valores: expect.objectContaining({ contact_id: 'c1', subject: 'Hola', body: '<p>Hola</p>', status: 'sent', sent_by: 'u1' }) }])

    // Solo cambia de estado a quien seguia "sin contactar": si ya estaba mas avanzado no se le regresa.
    const contacto = updates.find((u) => u.tabla === 'contacts')!
    expect(contacto.valores).toMatchObject({ status: 'qualification' })
    expect(contacto.filtros).toEqual({ id: 'c1', status: 'no_contact' })

    // Es el primer correo: se agenda el seguimiento.
    expect(r.siguiente).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('tras el ultimo seguimiento no agenda nada mas', async () => {
    const { db } = dbFalso({ ...borrador, step: 3 })
    expect((await marcarEnviadoAMano(db, 'u1', 'b1')).siguiente).toBeNull()
  })

  it('rechaza lo que no existe o ya no es borrador, sin tocar nada', async () => {
    await expect(marcarEnviadoAMano(dbFalso(null).db, 'u1', 'x')).rejects.toThrow('Borrador no encontrado')
    const enviado = dbFalso({ ...borrador, status: 'sent' })
    await expect(marcarEnviadoAMano(enviado.db, 'u1', 'b1')).rejects.toThrow('ya no es un borrador')
    expect(enviado.updates).toEqual([])
    expect(enviado.inserts).toEqual([])
  })
})
