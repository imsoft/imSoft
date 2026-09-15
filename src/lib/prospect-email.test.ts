import { describe, it, expect } from 'vitest'
import { renderTemplate, missingFields, htmlToText, renderPlainEmail } from './prospect-email'

describe('renderTemplate', () => {
  it('sustituye los campos de la fila', () => {
    expect(renderTemplate('Hola {{nombre}} de {{empresa}}', { nombre: 'Ana', empresa: 'ACME' }))
      .toBe('Hola Ana de ACME')
  })

  it('sustituye todas las apariciones del mismo campo', () => {
    expect(renderTemplate('{{a}} y {{a}}', { a: 'x' })).toBe('x y x')
  })

  it('deja intacto el placeholder cuyo campo no existe, para que se note', () => {
    expect(renderTemplate('Hola {{falta}}', {})).toBe('Hola {{falta}}')
  })

  it('sustituye por vacio cuando el campo existe pero viene vacio', () => {
    expect(renderTemplate('Hola{{extra}}', { extra: '' })).toBe('Hola')
  })
})

describe('missingFields', () => {
  it('lista los campos que la fila no trae, sin repetir', () => {
    expect(missingFields('{{a}} {{b}} {{b}}', { a: '1' })).toEqual(['b'])
  })

  it('devuelve vacio cuando estan todos', () => {
    expect(missingFields('{{a}}', { a: '1' })).toEqual([])
  })
})

describe('htmlToText', () => {
  it('toma solo el body y quita las etiquetas', () => {
    const html = '<html><head><title>x</title></head><body><p>Hola</p></body></html>'
    expect(htmlToText(html)).toBe('Hola')
  })

  it('descarta el contenido de style y script', () => {
    const html = '<body><style>.a{color:red}</style><p>Hola</p><script>var x=1</script></body>'
    expect(htmlToText(html)).toBe('Hola')
  })

  it('separa los parrafos con una linea en blanco', () => {
    expect(htmlToText('<body><p>Uno</p><p>Dos</p></body>')).toBe('Uno\n\nDos')
  })

  it('convierte los <br> en saltos de linea', () => {
    expect(htmlToText('<body><p>Uno<br>Dos</p></body>')).toBe('Uno\nDos')
  })

  it('decodifica entidades, incluidas las numericas', () => {
    expect(htmlToText('<body><p>Caf&eacute; &amp; t&#233; &#171;x&#187;</p></body>'))
      .toBe('Caf&eacute; & té «x»')
  })

  it('no deja mas de una linea en blanco seguida', () => {
    expect(htmlToText('<body><p>Uno</p><div></div><div></div><p>Dos</p></body>')).toBe('Uno\n\nDos')
  })
})

describe('renderPlainEmail', () => {
  const tpl = '<body><h1>{{asunto}}</h1><p>{{saludo}}:</p><p>{{gancho}}</p></body>'
  const row = { asunto: 'Seis plazas, seis teléfonos', saludo: 'Hola Teresa', gancho: 'Vi que cada plaza tiene su teléfono.' }

  it('antepone el asunto al cuerpo', () => {
    const { text } = renderPlainEmail(tpl, row)
    expect(text.startsWith('Asunto: Seis plazas, seis teléfonos\n\n')).toBe(true)
    expect(text).toContain('Hola Teresa:')
  })

  it('devuelve el asunto y el cuerpo por separado', () => {
    const { subject, body } = renderPlainEmail(tpl, row)
    expect(subject).toBe('Seis plazas, seis teléfonos')
    expect(body.startsWith('Seis plazas')).toBe(true)
  })

  it('omite la linea de asunto si la fila no lo trae', () => {
    const { text } = renderPlainEmail('<body><p>{{saludo}}</p></body>', { saludo: 'Buen día' })
    expect(text).toBe('Buen día')
  })

  it('permite elegir de que columna sale el asunto', () => {
    const { subject } = renderPlainEmail(tpl, { ...row, otro: 'Otro asunto' }, { subjectField: 'otro' })
    expect(subject).toBe('Otro asunto')
  })
})

describe('htmlToText — lo que solo sirve en el correo HTML', () => {
  it('descarta lo marcado con data-plain="skip"', () => {
    const html = '<body><h1 data-plain="skip">Titulo</h1><p>Cuerpo</p></body>'
    expect(htmlToText(html)).toBe('Cuerpo')
  })

  it('conserva la URL de los enlaces, que si no quedan huerfanos al pegar', () => {
    const html = '<body><p><a href="https://wa.me/52333">Agendar 15 minutos</a></p></body>'
    expect(htmlToText(html)).toBe('Agendar 15 minutos: https://wa.me/52333')
  })

  it('deja mailto y tel con su texto, que ya dice la direccion', () => {
    const html = '<body><p>Escribe a <a href="mailto:hola@imsoft.io">hola@imsoft.io</a></p></body>'
    expect(htmlToText(html)).toBe('Escribe a hola@imsoft.io')
  })

  it('no duplica el asunto cuando el titulo esta marcado', () => {
    const tpl = '<body><h1 data-plain="skip">{{asunto}}</h1><p>{{saludo}}</p></body>'
    const { text } = renderPlainEmail(tpl, { asunto: 'Seis plazas', saludo: 'Hola Teresa' })
    expect(text).toBe('Asunto: Seis plazas\n\nHola Teresa')
  })
})

describe('htmlToText — enlaces cuyo texto ya es la direccion', () => {
  it('no repite la URL si el texto del enlace ya la dice', () => {
    expect(htmlToText('<body><p>Ver <a href="https://imsoft.io">imsoft.io</a></p></body>'))
      .toBe('Ver imsoft.io')
  })

  it('ignora la barra final al comparar', () => {
    expect(htmlToText('<body><p><a href="https://imsoft.io/">imsoft.io</a></p></body>'))
      .toBe('imsoft.io')
  })

  it('si el texto es distinto, si agrega la URL', () => {
    expect(htmlToText('<body><p><a href="https://imsoft.io/blog">nuestro blog</a></p></body>'))
      .toBe('nuestro blog: https://imsoft.io/blog')
  })
})
