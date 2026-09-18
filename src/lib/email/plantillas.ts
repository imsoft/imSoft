/**
 * Cada correo que manda la plataforma, sobre la plantilla unica de layout.ts.
 * Devuelven { subject, html } y no hacen E/S: las rutas solo los envian.
 */
import { SITE, barraProgreso, boton, codigo, datos, destacado, emailLayout, esc, parrafo, subtitulo, textoLibre, url } from './layout'

export interface Correo {
  subject: string
  html: string
}

const fechaHora = (d: Date) => d.toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Mexico_City' })

/** Aviso al admin: el cliente acepto la cotizacion. */
export function correoCotizacionAceptada(p: { nombre: string; folio: string; titulo: string; cliente: string; empresa?: string | null; total: string; quoteId: string; fecha?: Date }): Correo {
  return {
    subject: `✓ Cotización aceptada: ${p.folio} · ${p.titulo}`,
    html: emailLayout({
      preheader: `${p.nombre} aceptó ${p.folio} por ${p.total}`,
      etiqueta: 'Cotización aceptada',
      titulo: `${p.nombre} aceptó la cotización ${p.folio}`,
      cuerpo: [
        datos([
          ['Proyecto', esc(p.titulo)],
          ['Cliente', esc(p.cliente)],
          ['Empresa', esc(p.empresa ?? '')],
          ['Total', esc(p.total)],
          ['Aceptada', esc(fechaHora(p.fecha ?? new Date()))],
        ]),
        destacado('Genera el contrato y, si ya toca el anticipo, el enlace de pago.', 'exito', 'Siguiente paso'),
        boton('Abrir en el panel', `${SITE}/es/dashboard/admin/cotizaciones/${p.quoteId}`),
      ].join(''),
      pie: ['Aviso automático del panel de cotizaciones.'],
    }),
  }
}

/** Aviso al admin: el cliente firmo el contrato. */
export function correoContratoFirmado(p: { nombre: string; folio: string; titulo?: string | null; cotizacionFolio?: string | null; quoteId?: string | null; fecha?: Date }): Correo {
  return {
    subject: `✓ Contrato aceptado: ${p.folio}${p.titulo ? ` · ${p.titulo}` : ''}`,
    html: emailLayout({
      preheader: `${p.nombre} firmó el contrato ${p.folio}`,
      etiqueta: 'Contrato firmado',
      titulo: `${p.nombre} firmó el contrato ${p.folio}`,
      cuerpo: [
        datos([
          ['Proyecto', esc(p.titulo ?? '')],
          ['Cotización', esc(p.cotizacionFolio ?? '')],
          ['Firmado', esc(fechaHora(p.fecha ?? new Date()))],
        ]),
        destacado('Convierte la cotización en proyecto para registrar los pagos y arrancar.', 'exito', 'Siguiente paso'),
        p.quoteId ? boton('Abrir en el panel', `${SITE}/es/dashboard/admin/cotizaciones/${p.quoteId}`) : '',
      ].join(''),
      pie: ['Aviso automático del panel de cotizaciones.'],
    }),
  }
}

/** Al cliente: su cotizacion, con enlace para revisarla y aceptarla. */
export function correoCotizacionAlCliente(p: { cliente: string; folio: string; titulo: string; total: string; ivaIncluido: boolean; vigencia: string; enlace: string; whatsapp: string; descuento?: string | null }): Correo {
  return {
    subject: `Cotización ${p.folio} · ${p.titulo} · imSoft`,
    html: emailLayout({
      preheader: `Tu cotización de ${p.titulo}: ${p.total}. Vigente hasta el ${p.vigencia}.`,
      etiqueta: `Cotización ${p.folio}`,
      titulo: p.titulo,
      cuerpo: [
        parrafo(`Hola ${esc(p.cliente)}:`),
        parrafo('Te comparto la cotización del proyecto. La puedes revisar completa, descargarla en PDF y aceptarla en línea desde el mismo enlace.'),
        datos([
          ['Total', `${esc(p.total)}${p.ivaIncluido ? ' <span style="font-weight:normal;color:#6b7280">IVA incluido</span>' : ''}`],
          ['Descuento', esc(p.descuento ?? '')],
          ['Vigente hasta', esc(p.vigencia)],
        ]),
        boton('Revisar y aceptar la cotización', p.enlace),
        parrafo(`¿Dudas o cambios? Responde este correo o escríbeme por <a href="${url(p.whatsapp)}" style="color:#1e88e5;font-weight:bold;text-decoration:none">WhatsApp al 33 2536 5558</a>.`, { tenue: true, chico: true }),
        parrafo('Brandon García · imSoft', { chico: true }),
      ].join(''),
      pie: ['Recibes este correo porque solicitaste una cotización a imSoft.'],
    }),
  }
}

/** Al admin: mensaje del formulario de contacto del sitio. */
export function correoContacto(p: { nombre: string; email: string; telefono?: string | null; mensaje: string; panelUrl: string }): Correo {
  const tel = p.telefono?.trim()
  return {
    subject: `Nuevo mensaje de ${p.nombre} — imSoft`,
    html: emailLayout({
      preheader: p.mensaje.slice(0, 120),
      etiqueta: 'Formulario de contacto',
      titulo: `Nuevo mensaje de ${p.nombre}`,
      cuerpo: [
        datos([
          ['Nombre', esc(p.nombre)],
          ['Correo', `<a href="mailto:${esc(p.email)}" style="color:#1e88e5;text-decoration:none">${esc(p.email)}</a>`],
          ['Teléfono', tel ? `<a href="tel:${esc(tel.replace(/\s+/g, ''))}" style="color:#1e88e5;text-decoration:none">${esc(tel)}</a>` : ''],
        ]),
        subtitulo('Mensaje'),
        destacado(textoLibre(p.mensaje)),
        boton('Ver en el panel', p.panelUrl),
        parrafo('Puedes responderle directo a este correo: la respuesta le llega a la persona.', { tenue: true, chico: true }),
      ].join(''),
      pie: ['Recibiste este correo porque alguien llenó el formulario de contacto de imsoft.io.'],
    }),
  }
}

/** Al cliente: se completo una tarea de su proyecto. */
export function correoTareaCompletada(p: { cliente: string; proyecto: string; tarea: string; completadas: number; total: number; enlace: string }): Correo {
  const pct = p.total > 0 ? (p.completadas / p.total) * 100 : 0
  return {
    subject: `Actualización de tu proyecto: ${p.proyecto}`,
    html: emailLayout({
      preheader: `Completamos: ${p.tarea}. Tu proyecto va al ${Math.round(pct)}%.`,
      etiqueta: 'Avance de tu proyecto',
      titulo: p.proyecto,
      cuerpo: [
        parrafo(`Hola ${esc(p.cliente)}:`),
        parrafo('Terminamos una tarea más de tu proyecto.'),
        destacado(esc(p.tarea), 'exito', '✓ Tarea completada'),
        barraProgreso(pct, `${p.completadas} de ${p.total} tareas completadas`),
        boton('Ver el proyecto', p.enlace),
        parrafo('En tu panel ves todas las tareas, los avances y los pagos del proyecto.', { tenue: true, chico: true }),
      ].join(''),
      pie: ['Recibes este correo porque tienes un proyecto activo con imSoft.'],
    }),
  }
}

/** A los usuarios: nuevo articulo del blog. */
export function correoBlog(p: { nombre: string; titulo: string; resumen?: string | null; imagen?: string | null; enlace: string; bajaUrl: string; direccion?: string | null; lang?: string }): Correo {
  const en = p.lang === 'en'
  return {
    subject: p.titulo,
    html: emailLayout({
      lang: en ? 'en' : 'es',
      preheader: p.resumen?.slice(0, 120) || (en ? 'New article on the imSoft blog' : 'Nuevo artículo en el blog de imSoft'),
      etiqueta: en ? 'New on the blog' : 'Nuevo en el blog',
      titulo: p.titulo,
      portada: p.imagen ? { src: p.imagen, alt: p.titulo } : undefined,
      cuerpo: [
        parrafo(en ? `Hi ${esc(p.nombre)}, we just published a new article:` : `Hola ${esc(p.nombre)}, acabamos de publicar un artículo nuevo:`),
        p.resumen ? parrafo(esc(p.resumen), { tenue: true }) : '',
        boton(en ? 'Read the article' : 'Leer el artículo', p.enlace),
      ].join(''),
      pie: [
        en ? 'You receive this email because you have an account at imSoft.' : 'Recibes este correo porque tienes una cuenta en imSoft.',
        `<a href="${url(p.bajaUrl)}" style="color:#9ca3af;text-decoration:underline">${en ? 'Unsubscribe from these emails' : 'Darme de baja de estos correos'}</a>`,
        ...(p.direccion ? [esc(p.direccion)] : []),
      ],
    }),
  }
}

/** Al admin: fallo el envio del aviso del blog. */
export function correoFalloBlog(p: { titulo?: string | null; error: string }): Correo {
  return {
    subject: `⚠️ Falló el envío del aviso de blog${p.titulo ? `: ${p.titulo}` : ''}`,
    html: emailLayout({
      preheader: 'Ningún usuario recibió el aviso del artículo.',
      etiqueta: 'Alerta',
      titulo: 'Falló el aviso del nuevo artículo',
      cuerpo: [
        destacado('Ningún usuario recibió el correo. Corrige el problema y vuelve a guardar el artículo para reintentar.', 'alerta'),
        p.titulo ? datos([['Artículo', esc(p.titulo)]]) : '',
        subtitulo('Detalle del error'),
        codigo(p.error),
      ].join(''),
      pie: ['Aviso automático del blog.'],
    }),
  }
}
