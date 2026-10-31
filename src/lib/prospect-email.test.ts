import { describe, it, expect } from 'vitest'
import { renderTemplate, missingFields, htmlToText, renderPlainEmail } from './prospect-email'

describe('renderTemplate', () => {
  it("replaces the row's fields", () => {
    expect(renderTemplate('Hola {{first_name}} de {{company}}', { first_name: 'Ana', company: 'ACME' }))
      .toBe('Hola Ana de ACME')
  })

  it('replaces every occurrence of the same field', () => {
    expect(renderTemplate('{{a}} y {{a}}', { a: 'x' })).toBe('x y x')
  })

  it('leaves the placeholder of a missing field untouched, so it shows', () => {
    expect(renderTemplate('Hola {{missing}}', {})).toBe('Hola {{missing}}')
  })

  it('replaces with empty when the field exists but is empty', () => {
    expect(renderTemplate('Hola{{extra}}', { extra: '' })).toBe('Hola')
  })
})

describe('missingFields', () => {
  it('lists the fields the row does not have, without repeats', () => {
    expect(missingFields('{{a}} {{b}} {{b}}', { a: '1' })).toEqual(['b'])
  })

  it('returns empty when all are there', () => {
    expect(missingFields('{{a}}', { a: '1' })).toEqual([])
  })
})

describe('htmlToText', () => {
  it('takes only the body and strips the tags', () => {
    const html = '<html><head><title>x</title></head><body><p>Hola</p></body></html>'
    expect(htmlToText(html)).toBe('Hola')
  })

  it('drops the content of style and script', () => {
    const html = '<body><style>.a{color:red}</style><p>Hola</p><script>var x=1</script></body>'
    expect(htmlToText(html)).toBe('Hola')
  })

  it('separates paragraphs with a blank line', () => {
    expect(htmlToText('<body><p>Uno</p><p>Dos</p></body>')).toBe('Uno\n\nDos')
  })

  it('turns <br> into line breaks', () => {
    expect(htmlToText('<body><p>Uno<br>Dos</p></body>')).toBe('Uno\nDos')
  })

  it('decodes entities, including numeric ones', () => {
    expect(htmlToText('<body><p>Caf&eacute; &amp; t&#233; &#171;x&#187;</p></body>'))
      .toBe('Caf&eacute; & té «x»')
  })

  it('leaves no more than one blank line in a row', () => {
    expect(htmlToText('<body><p>Uno</p><div></div><div></div><p>Dos</p></body>')).toBe('Uno\n\nDos')
  })
})

describe('renderPlainEmail', () => {
  const tpl = '<body><h1>{{subject}}</h1><p>{{greeting}}:</p><p>{{hook}}</p></body>'
  const row = { subject: 'Seis plazas, seis teléfonos', greeting: 'Hola Teresa', hook: 'Vi que cada plaza tiene su teléfono.' }

  it('puts the subject before the body', () => {
    const { text } = renderPlainEmail(tpl, row)
    expect(text.startsWith('Asunto: Seis plazas, seis teléfonos\n\n')).toBe(true)
    expect(text).toContain('Hola Teresa:')
  })

  it('returns the subject and the body separately', () => {
    const { subject, body } = renderPlainEmail(tpl, row)
    expect(subject).toBe('Seis plazas, seis teléfonos')
    expect(body.startsWith('Seis plazas')).toBe(true)
  })

  it('omits the subject line if the row does not have one', () => {
    const { text } = renderPlainEmail('<body><p>{{greeting}}</p></body>', { greeting: 'Buen día' })
    expect(text).toBe('Buen día')
  })

  it('lets you choose which column the subject comes from', () => {
    const { subject } = renderPlainEmail(tpl, { ...row, other: 'Otro asunto' }, { subjectField: 'other' })
    expect(subject).toBe('Otro asunto')
  })
})

describe('htmlToText — what only makes sense in the HTML email', () => {
  it('drops what is marked with data-plain="skip"', () => {
    const html = '<body><h1 data-plain="skip">Titulo</h1><p>Cuerpo</p></body>'
    expect(htmlToText(html)).toBe('Cuerpo')
  })

  it('keeps the URL of links, otherwise they are orphaned when pasted', () => {
    const html = '<body><p><a href="https://wa.me/52333">Agendar 15 minutos</a></p></body>'
    expect(htmlToText(html)).toBe('Agendar 15 minutos: https://wa.me/52333')
  })

  it('leaves mailto and tel with their text, which already says the address', () => {
    const html = '<body><p>Escribe a <a href="mailto:hola@imsoft.io">hola@imsoft.io</a></p></body>'
    expect(htmlToText(html)).toBe('Escribe a hola@imsoft.io')
  })

  it('does not duplicate the subject when the title is marked', () => {
    const tpl = '<body><h1 data-plain="skip">{{subject}}</h1><p>{{greeting}}</p></body>'
    const { text } = renderPlainEmail(tpl, { subject: 'Seis plazas', greeting: 'Hola Teresa' })
    expect(text).toBe('Asunto: Seis plazas\n\nHola Teresa')
  })
})

describe('htmlToText — links whose text already is the address', () => {
  it('does not repeat the URL if the link text already says it', () => {
    expect(htmlToText('<body><p>Ver <a href="https://imsoft.io">imsoft.io</a></p></body>'))
      .toBe('Ver imsoft.io')
  })

  it('ignores the trailing slash when comparing', () => {
    expect(htmlToText('<body><p><a href="https://imsoft.io/">imsoft.io</a></p></body>'))
      .toBe('imsoft.io')
  })

  it('if the text is different, it does add the URL', () => {
    expect(htmlToText('<body><p><a href="https://imsoft.io/blog">nuestro blog</a></p></body>'))
      .toBe('nuestro blog: https://imsoft.io/blog')
  })
})
