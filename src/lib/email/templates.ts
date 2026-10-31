/**
 * Every email the platform sends, on the single layout.ts template.
 * They return { subject, html } and do no I/O: the routes only send them.
 */
import { SITE, barraProgreso, boton, codigo, datos, destacado, emailLayout, esc, parrafo, subtitulo, textoLibre, url } from './layout'

export interface Email {
  subject: string
  html: string
}

const dateTime = (d: Date) => d.toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Mexico_City' })

/** Admin notice: the client accepted the quote. */
export function quoteAcceptedEmail(p: { name: string; number: string; title: string; client: string; company?: string | null; total: string; quoteId: string; date?: Date }): Email {
  return {
    subject: `✓ Cotización aceptada: ${p.number} · ${p.title}`,
    html: emailLayout({
      preheader: `${p.name} aceptó ${p.number} por ${p.total}`,
      etiqueta: 'Cotización aceptada',
      titulo: `${p.name} aceptó la cotización ${p.number}`,
      cuerpo: [
        datos([
          ['Proyecto', esc(p.title)],
          ['Cliente', esc(p.client)],
          ['Empresa', esc(p.company ?? '')],
          ['Total', esc(p.total)],
          ['Aceptada', esc(dateTime(p.date ?? new Date()))],
        ]),
        destacado('Genera el contrato y, si ya toca el anticipo, el enlace de pago.', 'exito', 'Siguiente paso'),
        boton('Abrir en el panel', `${SITE}/es/dashboard/admin/cotizaciones/${p.quoteId}`),
      ].join(''),
      pie: ['Aviso automático del panel de cotizaciones.'],
    }),
  }
}

/** Admin notice: the client signed the contract. */
export function contractSignedEmail(p: { name: string; number: string; title?: string | null; quoteNumber?: string | null; quoteId?: string | null; date?: Date }): Email {
  return {
    subject: `✓ Contrato aceptado: ${p.number}${p.title ? ` · ${p.title}` : ''}`,
    html: emailLayout({
      preheader: `${p.name} firmó el contrato ${p.number}`,
      etiqueta: 'Contrato firmado',
      titulo: `${p.name} firmó el contrato ${p.number}`,
      cuerpo: [
        datos([
          ['Proyecto', esc(p.title ?? '')],
          ['Cotización', esc(p.quoteNumber ?? '')],
          ['Firmado', esc(dateTime(p.date ?? new Date()))],
        ]),
        destacado('Convierte la cotización en proyecto para registrar los pagos y arrancar.', 'exito', 'Siguiente paso'),
        p.quoteId ? boton('Abrir en el panel', `${SITE}/es/dashboard/admin/cotizaciones/${p.quoteId}`) : '',
      ].join(''),
      pie: ['Aviso automático del panel de cotizaciones.'],
    }),
  }
}

/** To the client: their quote, with a link to review and accept it. */
export function quoteToClientEmail(p: { client: string; number: string; title: string; total: string; vatIncluded: boolean; validUntil: string; link: string; whatsapp: string; discount?: string | null }): Email {
  return {
    subject: `Cotización ${p.number} · ${p.title} · imSoft`,
    html: emailLayout({
      preheader: `Tu cotización de ${p.title}: ${p.total}. Vigente hasta el ${p.validUntil}.`,
      etiqueta: `Cotización ${p.number}`,
      titulo: p.title,
      cuerpo: [
        parrafo(`Hola ${esc(p.client)}:`),
        parrafo('Te comparto la cotización del proyecto. La puedes revisar completa, descargarla en PDF y aceptarla en línea desde el mismo enlace.'),
        datos([
          ['Total', `${esc(p.total)}${p.vatIncluded ? ' <span style="font-weight:normal;color:#6b7280">IVA incluido</span>' : ''}`],
          ['Descuento', esc(p.discount ?? '')],
          ['Vigente hasta', esc(p.validUntil)],
        ]),
        boton('Revisar y aceptar la cotización', p.link),
        parrafo(`¿Dudas o cambios? Responde este correo o escríbeme por <a href="${url(p.whatsapp)}" style="color:#1e88e5;font-weight:bold;text-decoration:none">WhatsApp al 33 2536 5558</a>.`, { tenue: true, chico: true }),
        parrafo('Brandon García · imSoft', { chico: true }),
      ].join(''),
      pie: ['Recibes este correo porque solicitaste una cotización a imSoft.'],
    }),
  }
}

/** To the admin: a message from the site's contact form. */
export function contactEmail(p: { name: string; email: string; phone?: string | null; message: string; panelUrl: string }): Email {
  const tel = p.phone?.trim()
  return {
    subject: `Nuevo mensaje de ${p.name} — imSoft`,
    html: emailLayout({
      preheader: p.message.slice(0, 120),
      etiqueta: 'Formulario de contacto',
      titulo: `Nuevo mensaje de ${p.name}`,
      cuerpo: [
        datos([
          ['Nombre', esc(p.name)],
          ['Correo', `<a href="mailto:${esc(p.email)}" style="color:#1e88e5;text-decoration:none">${esc(p.email)}</a>`],
          ['Teléfono', tel ? `<a href="tel:${esc(tel.replace(/\s+/g, ''))}" style="color:#1e88e5;text-decoration:none">${esc(tel)}</a>` : ''],
        ]),
        subtitulo('Mensaje'),
        destacado(textoLibre(p.message)),
        boton('Ver en el panel', p.panelUrl),
        parrafo('Puedes responderle directo a este correo: la respuesta le llega a la persona.', { tenue: true, chico: true }),
      ].join(''),
      pie: ['Recibiste este correo porque alguien llenó el formulario de contacto de imsoft.io.'],
    }),
  }
}

/** To the client: a task of their project was completed. */
export function taskCompletedEmail(p: { client: string; project: string; task: string; completed: number; total: number; link: string }): Email {
  const pct = p.total > 0 ? (p.completed / p.total) * 100 : 0
  return {
    subject: `Actualización de tu proyecto: ${p.project}`,
    html: emailLayout({
      preheader: `Completamos: ${p.task}. Tu proyecto va al ${Math.round(pct)}%.`,
      etiqueta: 'Avance de tu proyecto',
      titulo: p.project,
      cuerpo: [
        parrafo(`Hola ${esc(p.client)}:`),
        parrafo('Terminamos una tarea más de tu proyecto.'),
        destacado(esc(p.task), 'exito', '✓ Tarea completada'),
        barraProgreso(pct, `${p.completed} de ${p.total} tareas completadas`),
        boton('Ver el proyecto', p.link),
        parrafo('En tu panel ves todas las tareas, los avances y los pagos del proyecto.', { tenue: true, chico: true }),
      ].join(''),
      pie: ['Recibes este correo porque tienes un proyecto activo con imSoft.'],
    }),
  }
}

/** To users: a new blog article. */
export function blogPostEmail(p: { name: string; title: string; excerpt?: string | null; image?: string | null; link: string; unsubscribeUrl: string; address?: string | null; lang?: string }): Email {
  const en = p.lang === 'en'
  return {
    subject: p.title,
    html: emailLayout({
      lang: en ? 'en' : 'es',
      preheader: p.excerpt?.slice(0, 120) || (en ? 'New article on the imSoft blog' : 'Nuevo artículo en el blog de imSoft'),
      etiqueta: en ? 'New on the blog' : 'Nuevo en el blog',
      titulo: p.title,
      portada: p.image ? { src: p.image, alt: p.title } : undefined,
      cuerpo: [
        parrafo(en ? `Hi ${esc(p.name)}, we just published a new article:` : `Hola ${esc(p.name)}, acabamos de publicar un artículo nuevo:`),
        p.excerpt ? parrafo(esc(p.excerpt), { tenue: true }) : '',
        boton(en ? 'Read the article' : 'Leer el artículo', p.link),
      ].join(''),
      pie: [
        en ? 'You receive this email because you have an account at imSoft.' : 'Recibes este correo porque tienes una cuenta en imSoft.',
        `<a href="${url(p.unsubscribeUrl)}" style="color:#9ca3af;text-decoration:underline">${en ? 'Unsubscribe from these emails' : 'Darme de baja de estos correos'}</a>`,
        ...(p.address ? [esc(p.address)] : []),
      ],
    }),
  }
}

/** To the admin: sending the blog notice failed. */
export function blogNotifyFailedEmail(p: { title?: string | null; error: string }): Email {
  return {
    subject: `⚠️ Falló el envío del aviso de blog${p.title ? `: ${p.title}` : ''}`,
    html: emailLayout({
      preheader: 'Ningún usuario recibió el aviso del artículo.',
      etiqueta: 'Alerta',
      titulo: 'Falló el aviso del nuevo artículo',
      cuerpo: [
        destacado('Ningún usuario recibió el correo. Corrige el problema y vuelve a guardar el artículo para reintentar.', 'alerta'),
        p.title ? datos([['Artículo', esc(p.title)]]) : '',
        subtitulo('Detalle del error'),
        codigo(p.error),
      ].join(''),
      pie: ['Aviso automático del blog.'],
    }),
  }
}

/** To the client: one-time code to sign in to the mobile app. */
export function appLoginCodeEmail(p: { code: string; minutes: number }): Email {
  return {
    subject: `${p.code} es tu código para entrar a imSoft`,
    html: emailLayout({
      preheader: `Tu código es ${p.code}. Vence en ${p.minutes} minutos.`,
      etiqueta: 'App de clientes',
      titulo: 'Tu código para entrar',
      cuerpo: [
        parrafo('Escribe este código en la app de imSoft para iniciar sesión:'),
        // Large and spaced out: readable at a glance and copied from the phone without mistakes.
        `<p style="margin:0 0 20px;padding:18px 12px;background:#f4f6fb;border:1px solid #e3e8f0;border-radius:12px;text-align:center;font-family:Menlo,Consolas,monospace;font-size:30px;font-weight:700;letter-spacing:6px;color:#0f172a">${esc(p.code)}</p>`,
        parrafo(`Vence en ${p.minutes} minutos y sirve una sola vez.`, { tenue: true }),
        parrafo('Si no intentaste entrar, ignora este correo: nadie puede acceder sin el código.', { tenue: true, chico: true }),
      ].join(''),
      pie: ['Recibiste este correo porque alguien pidió entrar a la app de imSoft con esta dirección.'],
    }),
  }
}
