import { describe, expect, it } from 'vitest'
import { canalesDe, numeroWhatsApp, renderMensajeRed, TOPE_CANAL, urlDeRed } from './mensaje-red'

const v = { nombre: 'Héctor', empresa: 'Gil y Gil', gancho: 'Cada filial lleva sus pedimentos en su propio Excel.', segmento: 'logistica-gdl' }

describe('mensaje para redes', () => {
  it('lleva saludo, presentacion, el mismo gancho del correo y la propuesta de 15 minutos', () => {
    const t = renderMensajeRed('instagram', v)
    expect(t.startsWith('Hola Héctor, soy Brandon, de imSoft.')).toBe(true)
    expect(t).toContain('aduanal y logístico')
    expect(t).toContain(v.gancho)
    expect(t).toContain('15 minutos')
    // Nada de correo: sin asunto, sin firma, sin enlaces.
    expect(t).not.toMatch(/asunto|https?:\/\/|saludos/i)
  })

  it('sin nombre saluda igual, y fuera de logistica usa la presentacion general', () => {
    const t = renderMensajeRed('facebook', { ...v, nombre: '', segmento: null })
    expect(t.startsWith('Hola, soy Brandon')).toBe(true)
    expect(t).toContain('procesos a mano o en Excel')
  })

  it('LinkedIn es mas largo y menciona precio fijo; Instagram no', () => {
    expect(renderMensajeRed('linkedin', v)).toContain('precio fijo')
    expect(renderMensajeRed('instagram', v)).not.toContain('precio fijo')
    expect(renderMensajeRed('linkedin', v).length).toBeGreaterThan(renderMensajeRed('instagram', v).length)
  })

  it('respeta el tope de cada red sin cortar a media palabra', () => {
    const t = renderMensajeRed('tiktok', { ...v, gancho: 'palabra '.repeat(200) })
    expect(t.length).toBeLessThanOrEqual(TOPE_CANAL.tiktok)
    expect(t.endsWith('…')).toBe(true)
  })
})

describe('numero de WhatsApp', () => {
  it('acepta 10 digitos, 52+10 y 521+10; rechaza lo demas', () => {
    expect(numeroWhatsApp('33 2536 5558')).toBe('523325365558')
    expect(numeroWhatsApp('+52 33 2536 5558')).toBe('523325365558')
    expect(numeroWhatsApp('5213325365558')).toBe('523325365558')
    expect(numeroWhatsApp('12345')).toBeNull()
    expect(numeroWhatsApp(null)).toBeNull()
  })
})

describe('canales disponibles de un contacto', () => {
  it('sale de sus redes y del telefono, en orden fijo, con la URL para abrir cada uno', () => {
    const c = { instagram_url: '@ferreteria', phone: '3312345678', social_links: [{ platform: 'linkedin' as const, url: 'https://linkedin.com/company/x' }, { platform: 'youtube' as const, url: 'x' }] }
    expect(canalesDe(c, 'hola')).toEqual([
      { canal: 'instagram', url: 'https://instagram.com/ferreteria' },
      { canal: 'whatsapp', url: 'https://wa.me/523312345678?text=hola' },
      { canal: 'linkedin', url: 'https://linkedin.com/company/x' },
    ])
  })

  it('sin redes ni telefono no hay canales', () => {
    expect(canalesDe({})).toEqual([])
    expect(canalesDe({ phone: '123' })).toEqual([])
  })

  it('urlDeRed arma el perfil a partir del usuario', () => {
    expect(urlDeRed({ platform: 'tiktok', url: '@imsoft' })).toBe('https://tiktok.com/@imsoft')
    expect(urlDeRed({ platform: 'whatsapp', url: '+52 33 1234 5678' })).toBe('https://wa.me/523312345678')
  })
})
