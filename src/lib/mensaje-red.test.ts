import { describe, expect, it } from 'vitest'
import { canalDeAsunto, canalesDe, colaDeRedes, conteoPorCanal, estadoDelTope, ETIQUETA_CANAL, numeroWhatsApp, ofertaDe, renderMensajeRed, TOPE_CANAL, TOPE_DIARIO_CANAL, urlDeRed } from './mensaje-red'

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

  it('el WhatsApp publicado por el negocio gana al telefono, que suele ser fijo', () => {
    const c = { phone: '33 3880 6000', social_links: [{ platform: 'whatsapp' as const, url: '+523316029326' }] }
    expect(canalesDe(c)).toEqual([{ canal: 'whatsapp', url: 'https://wa.me/523316029326' }])
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

describe('tope diario por red', () => {
  it('el asunto con que se registra cada envio se lee de vuelta como canal', () => {
    for (const c of ['instagram', 'whatsapp', 'twitter'] as const) expect(canalDeAsunto(`Mensaje por ${ETIQUETA_CANAL[c]}`)).toBe(c)
    expect(canalDeAsunto('Llamada de seguimiento')).toBeNull()
    expect(canalDeAsunto(null)).toBeNull()
  })

  it('cuenta por canal e ignora lo que no es mensaje por redes', () => {
    const c = conteoPorCanal(['Mensaje por Instagram', 'Mensaje por WhatsApp', 'Mensaje por Instagram', 'Nota', null])
    expect(c.instagram).toBe(2)
    expect(c.whatsapp).toBe(1)
    expect(c.linkedin).toBe(0)
  })

  it('avisa cuando faltan 3 o menos y frena al llegar al tope', () => {
    const t = TOPE_DIARIO_CANAL.whatsapp
    expect(estadoDelTope(0, 'whatsapp')).toBe('bien')
    expect(estadoDelTope(t - 4, 'whatsapp')).toBe('bien')
    expect(estadoDelTope(t - 3, 'whatsapp')).toBe('cerca')
    expect(estadoDelTope(t, 'whatsapp')).toBe('tope')
    expect(estadoDelTope(t + 5, 'whatsapp')).toBe('tope')
  })
})

describe('cola de redes', () => {
  const base = { first_name: 'Ana', last_name: 'Ruiz', company: 'Acme', email: 'a@acme.mx', phone: null, instagram_url: null, social_links: null }
  it('solo entra quien tiene WhatsApp o Instagram; LinkedIn solo no cuenta', () => {
    const cola = colaDeRedes([
      { ...base, id: 'sin', social_links: [{ platform: 'linkedin', url: 'ana' }] },
      { ...base, id: 'ig', instagram_url: '@acme' },
      { ...base, id: 'wa', phone: '33 2536 5558' },
    ])
    expect(cola.map((f) => f.id)).toEqual(['wa', 'ig'])
    expect(cola[0].canales).toEqual(['whatsapp'])
    expect(cola[1].canales).toEqual(['instagram'])
  })

  it('primero los que no tienen correo, luego los de WhatsApp, y arma nombre y empresa', () => {
    const cola = colaDeRedes([
      { ...base, id: 'ig-correo', instagram_url: 'acme' },
      { ...base, id: 'wa-correo', phone: '3325365558' },
      { ...base, id: 'ig-sin-correo', email: '', instagram_url: 'acme', first_name: ' Ana ', last_name: null, company: ' Acme ' },
    ])
    expect(cola.map((f) => f.id)).toEqual(['ig-sin-correo', 'wa-correo', 'ig-correo'])
    expect(cola[0]).toMatchObject({ nombre: 'Ana', empresa: 'Acme', sinCorreo: true })
    expect(cola[1].sinCorreo).toBe(false)
  })

  it('dentro de cada grupo, primero los de zona premium', () => {
    const cola = colaDeRedes([
      { ...base, id: 'wa', email: '', phone: '3325365558' },
      { ...base, id: 'wa-premium', email: '', phone: '3325365559', tags: ['restaurantes', 'zona-premium'] },
      { ...base, id: 'correo-premium', phone: '3325365550', tags: ['zona-premium'] },
    ])
    // La zona ordena dentro del grupo, no le gana a "sin correo".
    expect(cola.map((f) => f.id)).toEqual(['wa-premium', 'wa', 'correo-premium'])
    expect(cola[0].zonaPremium).toBe(true)
  })

  it('a restaurantes, gimnasios y tiendas les ofrece su propia app', () => {
    expect(ofertaDe(['google-places', 'restaurantes'])).toBe('app')
    expect(ofertaDe(['fitness-gdl'])).toBe('app')
    expect(ofertaDe(['ecommerce'])).toBe('app')
    expect(ofertaDe(['ferreteria'])).toBeNull()
    expect(ofertaDe(null)).toBeNull()
    // Una cadena grande con area de sistemas no recibe el mensaje de la app.
    expect(ofertaDe(['restaurantes', 'corporativo'])).toBeNull()

    const t = renderMensajeRed('instagram', { nombre: '', empresa: 'Tukafe', gancho: 'Sus clientes frecuentes piden por WhatsApp y nadie los premia.', oferta: 'app' })
    expect(t).toContain('apps a la medida')
    expect(t).toContain('pedidos, puntos y promociones')
    expect(t).not.toContain('Excel')
    // Sin oferta, el mensaje de siempre.
    expect(renderMensajeRed('instagram', { nombre: '', empresa: 'X', gancho: 'g' })).toContain('procesos a mano o en Excel')
  })

  it('con teléfono e Instagram da los dos canales, WhatsApp primero', () => {
    const [f] = colaDeRedes([{ ...base, id: 'x', phone: '3325365558', instagram_url: 'acme' }])
    expect(f.canales).toEqual(['whatsapp', 'instagram'])
  })
})
