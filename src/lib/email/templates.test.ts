import { describe, expect, it } from 'vitest'
import { blogPostEmail, appLoginCodeEmail, contactEmail, contractSignedEmail, quoteAcceptedEmail, quoteToClientEmail, blogNotifyFailedEmail, taskCompletedEmail } from './templates'

const all = () => [
  quoteAcceptedEmail({ name: 'Álvaro Gutiérrez', number: 'COT-2026-001', title: 'Plataforma de avalúos', client: 'Álvaro', company: 'Valuadores de los Altos', total: '$199,404.00', quoteId: 'q1' }),
  contractSignedEmail({ name: 'Álvaro', number: 'CON-2026-001', title: 'Plataforma', quoteNumber: 'COT-2026-001', quoteId: 'q1' }),
  quoteToClientEmail({ client: 'Álvaro', number: 'COT-2026-001', title: 'Plataforma', total: '$199,404.00', vatIncluded: true, validUntil: '16 de octubre de 2026', link: 'https://www.imsoft.io/es/cotizacion/abc', whatsapp: 'https://wa.me/523325365558' }),
  contactEmail({ name: 'Ana', email: 'ana@x.mx', phone: '33 1234 5678', message: 'Hola\nquiero una web', panelUrl: 'https://www.imsoft.io/es/dashboard/admin/contact-messages' }),
  taskCompletedEmail({ client: 'Ana', project: 'Web', task: 'Diseño', completed: 3, total: 10, link: 'https://www.imsoft.io/es/dashboard/client/projects/p1' }),
  blogPostEmail({ name: 'Ana', title: 'Cuánto cuesta una app', excerpt: 'Guía', image: 'https://x.mx/i.png', link: 'https://www.imsoft.io/es/blog/x', unsubscribeUrl: 'https://www.imsoft.io/baja?t=1' }),
  blogNotifyFailedEmail({ title: 'Post', error: 'Resend 500' }),
  appLoginCodeEmail({ code: '48291637', minutes: 60 }),
]

describe('platform emails', () => {
  it('all use the imSoft template and none the old colors', () => {
    for (const c of all()) {
      expect(c.subject.length).toBeGreaterThan(3)
      expect(c.html).toContain('imsoft-isotipo-correo-v3.png')
      expect(c.html).toContain('#1e88e5')
      expect(c.html).not.toMatch(/#667eea|#764ba2|#6366f1|#a5b4fc/i)
    }
  })

  it('each one carries its key content', () => {
    const [accepted, contract, toClient, contact, task, blog, failed] = all()
    expect(accepted.subject).toBe('✓ Cotización aceptada: COT-2026-001 · Plataforma de avalúos')
    expect(accepted.html).toContain('Valuadores de los Altos')
    expect(accepted.html).toContain('/es/dashboard/admin/cotizaciones/q1')
    expect(contract.html).toContain('firmó el contrato CON-2026-001')
    expect(toClient.html).toContain('Revisar y aceptar la cotización')
    expect(toClient.html).toContain('IVA incluido')
    expect(contact.html).toContain('Hola<br>quiero una web')
    expect(contact.html).toContain('tel:3312345678')
    expect(task.html).toContain('30%')
    expect(task.html).toContain('3 de 10 tareas completadas')
    expect(blog.html).toContain('Darme de baja de estos correos')
    expect(blog.html).toContain('https://x.mx/i.png')
    expect(failed.html).toContain('Resend 500')
  })

  it('escapes what visitors type in the form', () => {
    const c = contactEmail({ name: '<b>X</b>', email: 'x@x.mx', message: '<script>alert(1)</script>', panelUrl: 'https://www.imsoft.io' })
    expect(c.html).not.toContain('<script>')
    expect(c.html).toContain('&lt;script&gt;')
    expect(c.html).not.toContain('<b>X</b>')
  })

  it('the app code goes in the subject and the body, with its expiry', () => {
    const c = appLoginCodeEmail({ code: '48291637', minutes: 60 })
    expect(c.subject).toBe('48291637 es tu código para entrar a imSoft')
    expect(c.html).toContain('48291637')
    expect(c.html).toContain('Vence en 60 minutos')
  })
})
