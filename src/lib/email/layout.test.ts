import { describe, expect, it } from 'vitest'
import { progressBar, button, dataTable, callout, emailLayout, esc, plainText, url } from './layout'

describe('plantilla de correos de imSoft', () => {
  it('arma el correo con logo, etiqueta, título, cuerpo y pie', () => {
    const html = emailLayout({ preheader: 'Vista previa', label: 'Cotización aceptada', title: 'Álvaro aceptó', body: '<p>hola</p>', footer: ['Motivo del correo'] })
    expect(html).toContain('imsoft-isotipo-correo-v3.png')
    expect(html).toContain('Cotización aceptada')
    expect(html).toContain('Álvaro aceptó')
    expect(html).toContain('<p>hola</p>')
    expect(html).toContain('Motivo del correo')
    expect(html).toContain('Vista previa')
    expect(html).toContain('#1e88e5')
    // Nada de los morados de las plantillas anteriores
    expect(html).not.toMatch(/#667eea|#764ba2|#6366f1/i)
  })

  it('escapa lo que viene de usuarios y bloquea URLs peligrosas', () => {
    expect(esc('<script>"x"&')).toBe('&lt;script&gt;&quot;x&quot;&amp;')
    expect(plainText('hola\n<b>')).toBe('hola<br>&lt;b&gt;')
    expect(url('javascript:alert(1)')).toBe('#')
    expect(url('https://www.imsoft.io/x?a=1&b=2')).toBe('https://www.imsoft.io/x?a=1&amp;b=2')
    expect(button('Ver', 'javascript:x')).toContain('href="#"')
    const html = emailLayout({ preheader: '<x>', title: '<img src=x onerror=1>', body: '' })
    expect(html).not.toContain('<img src=x')
  })

  it('piezas: datos omite vacíos, destacado usa el tono y la barra se acota a 0-100', () => {
    const t = dataTable([['Cliente', 'Ana'], ['Teléfono', ''], ['Total', '$1']])
    expect(t).toContain('Cliente')
    expect(t).not.toContain('Teléfono')
    expect(dataTable([['x', '']])).toBe('')
    expect(callout('ok', 'success', 'Tarea completada')).toContain('#047857')
    expect(progressBar(140)).toContain('100%')
    expect(progressBar(-5)).toContain('0%')
    expect(progressBar(40, '4 de 10 tareas')).toContain('4 de 10 tareas')
  })
})
