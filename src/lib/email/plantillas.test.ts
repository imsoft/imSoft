import { describe, expect, it } from 'vitest'
import { correoBlog, correoContacto, correoContratoFirmado, correoCotizacionAceptada, correoCotizacionAlCliente, correoFalloBlog, correoTareaCompletada } from './plantillas'

const todos = () => [
  correoCotizacionAceptada({ nombre: 'Álvaro Gutiérrez', folio: 'COT-2026-001', titulo: 'Plataforma de avalúos', cliente: 'Álvaro', empresa: 'Valuadores de los Altos', total: '$199,404.00', quoteId: 'q1' }),
  correoContratoFirmado({ nombre: 'Álvaro', folio: 'CON-2026-001', titulo: 'Plataforma', cotizacionFolio: 'COT-2026-001', quoteId: 'q1' }),
  correoCotizacionAlCliente({ cliente: 'Álvaro', folio: 'COT-2026-001', titulo: 'Plataforma', total: '$199,404.00', ivaIncluido: true, vigencia: '16 de octubre de 2026', enlace: 'https://www.imsoft.io/es/cotizacion/abc', whatsapp: 'https://wa.me/523325365558' }),
  correoContacto({ nombre: 'Ana', email: 'ana@x.mx', telefono: '33 1234 5678', mensaje: 'Hola\nquiero una web', panelUrl: 'https://www.imsoft.io/es/dashboard/admin/contact-messages' }),
  correoTareaCompletada({ cliente: 'Ana', proyecto: 'Web', tarea: 'Diseño', completadas: 3, total: 10, enlace: 'https://www.imsoft.io/es/dashboard/client/projects/p1' }),
  correoBlog({ nombre: 'Ana', titulo: 'Cuánto cuesta una app', resumen: 'Guía', imagen: 'https://x.mx/i.png', enlace: 'https://www.imsoft.io/es/blog/x', bajaUrl: 'https://www.imsoft.io/baja?t=1' }),
  correoFalloBlog({ titulo: 'Post', error: 'Resend 500' }),
]

describe('correos de la plataforma', () => {
  it('todos usan la plantilla de imSoft y ninguno los colores viejos', () => {
    for (const c of todos()) {
      expect(c.subject.length).toBeGreaterThan(3)
      expect(c.html).toContain('imsoft-isotipo-correo-v2.png')
      expect(c.html).toContain('#1e88e5')
      expect(c.html).not.toMatch(/#667eea|#764ba2|#6366f1|#a5b4fc/i)
    }
  })

  it('cada uno lleva su contenido clave', () => {
    const [acept, contrato, alCliente, contacto, tarea, blog, fallo] = todos()
    expect(acept.subject).toBe('✓ Cotización aceptada: COT-2026-001 · Plataforma de avalúos')
    expect(acept.html).toContain('Valuadores de los Altos')
    expect(acept.html).toContain('/es/dashboard/admin/cotizaciones/q1')
    expect(contrato.html).toContain('firmó el contrato CON-2026-001')
    expect(alCliente.html).toContain('Revisar y aceptar la cotización')
    expect(alCliente.html).toContain('IVA incluido')
    expect(contacto.html).toContain('Hola<br>quiero una web')
    expect(contacto.html).toContain('tel:3312345678')
    expect(tarea.html).toContain('30%')
    expect(tarea.html).toContain('3 de 10 tareas completadas')
    expect(blog.html).toContain('Darme de baja de estos correos')
    expect(blog.html).toContain('https://x.mx/i.png')
    expect(fallo.html).toContain('Resend 500')
  })

  it('escapa lo que escriben los visitantes en el formulario', () => {
    const c = correoContacto({ nombre: '<b>X</b>', email: 'x@x.mx', mensaje: '<script>alert(1)</script>', panelUrl: 'https://www.imsoft.io' })
    expect(c.html).not.toContain('<script>')
    expect(c.html).toContain('&lt;script&gt;')
    expect(c.html).not.toContain('<b>X</b>')
  })
})
