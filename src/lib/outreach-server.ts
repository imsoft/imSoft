/**
 * Prospeccion por correo: borradores, envio por Gmail y seguimientos. Solo servidor.
 */
import Anthropic from '@anthropic-ai/sdk'
import { resolveMx } from 'node:dns/promises'
import type { SupabaseClient } from '@supabase/supabase-js'
import { enviarRaw, estadoDelHilo, messageIdHeader, rebotesRecientes } from '@/lib/gmail/server'
import { GANCHO_TOOL, ganchoDesdeNotas, limpiarGancho, promptGancho } from '@/lib/outreach-ai'
import { estadoDeCorreo, fechaCorta, type FilaCorreo } from '@/lib/estado-correo'
import { buzonNoComercial } from '@/lib/correo-invalido'
import { colaDeRedes, conteoPorCanal, ofertaDe, renderMensajeRed, TOPE_DIARIO_CANAL, type Canal, type ContactoDeCola, type FilaCola, type Oferta } from '@/lib/mensaje-red'
import { dominioDeCorreo, construirMime, cuerpoDe, fechaSiguientePaso, renderDesdeCuerpo, renderOutreach, segmentoDe, topeDiario, type Step } from '@/lib/outreach'

const TZ = 'America/Mexico_City'

/** Fecha local (YYYY-MM-DD) en Guadalajara. */
export function hoyLocal(d = new Date()): string {
  return d.toLocaleDateString('en-CA', { timeZone: TZ })
}

export interface ContactoMin {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  company: string | null
  job_title: string | null
  website_url: string | null
  notes: string | null
  tags: string[] | null
  phone?: string | null
}

export const CONTACTO_COLS = 'id, first_name, last_name, email, phone, company, job_title, website_url, notes, tags'

export function nombreDe(c: Pick<ContactoMin, 'first_name'>): string {
  return (c.first_name ?? '').trim().split(/\s+/)[0] ?? ''
}

/** Cuantos van hoy y cuantos caben, segun la rampa desde el primer envio. */
export async function estadoCampana(db: SupabaseClient) {
  const { data: primero } = await db.from('outreach_emails').select('sent_at').not('sent_at', 'is', null).order('sent_at', { ascending: true }).limit(1).maybeSingle()
  const hoy = hoyLocal()
  const inicioHoy = new Date(`${hoy}T00:00:00-06:00`).toISOString()
  const { count } = await db.from('outreach_emails').select('id', { count: 'exact', head: true }).not('sent_at', 'is', null).gte('sent_at', inicioHoy)
  const dias = primero?.sent_at ? Math.floor((Date.now() - Date.parse(primero.sent_at)) / 86_400_000) : 0
  const tope = topeDiario(dias)
  return { hoy, enviadosHoy: count ?? 0, tope, diasDesdePrimerEnvio: dias, restanHoy: Math.max(0, tope - (count ?? 0)) }
}

/**
 * El dominio del correo existe y recibe correo (tiene MX). Evita rebotes como
 * info@gombienesraices.com, cuyo dominio no existe. Un fallo de red cuenta como valido
 * para no frenar borradores por un problema pasajero.
 */
export async function dominioRecibeCorreo(email: string | null | undefined, resolver: (d: string) => Promise<unknown[]> = resolveMx): Promise<boolean> {
  const dominio = dominioDeCorreo(email)
  if (!dominio) return false
  try {
    const mx = (await resolver(dominio)) as Array<{ exchange?: string }>
    // MX nulo (".") o apuntando a la propia maquina: el dominio declara que no recibe correo.
    return mx.some((r) => { const h = (r.exchange ?? '').toLowerCase().replace(/\.$/, ''); return h !== '' && h !== 'localhost' })
  } catch (err) {
    const code = (err as { code?: string }).code
    return !(code === 'ENOTFOUND' || code === 'ENODATA')
  }
}

async function descartarSiNoRecibe(db: SupabaseClient, c: ContactoMin): Promise<boolean> {
  // Buzon de privacidad, facturacion, RH o legal: existe, pero no es a quien escribirle.
  if (!buzonNoComercial(c.email) && (await dominioRecibeCorreo(c.email))) return false
  await db.from('contacts').update({ tags: [...new Set([...(c.tags ?? []), 'correo-invalido'])], ...(c.email ? { invalid_emails: [c.email.toLowerCase()] } : {}), updated_at: new Date().toISOString() }).eq('id', c.id)
  return true
}

/** Gancho con Claude cuando el contacto no trae uno en sus notas. */
export async function ganchoConIA(c: ContactoMin, oferta: Oferta | null = null): Promise<string> {
  const client = new Anthropic()
  const msg = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 300,
    tools: [GANCHO_TOOL],
    tool_choice: { type: 'tool', name: 'gancho' },
    messages: [{ role: 'user', content: promptGancho({ nombre: nombreDe(c), empresa: c.company ?? '', segmento: segmentoDe(c.tags), sitio: c.website_url, notas: (c.notes ?? '').slice(0, 1500), cargo: c.job_title, oferta }) }],
  })
  const tool = msg.content.find((b) => b.type === 'tool_use')
  return limpiarGancho(tool && tool.type === 'tool_use' ? tool.input : null)
}

/**
 * Crea borradores del paso 1 para contactos prospecto sin contactar que aun no tienen
 * ninguno. El gancho sale de las notas del CRM; si no hay, lo propone la IA.
 */
export async function crearBorradoresPaso1(db: SupabaseClient, limite: number, campaign?: string | null) {
  const { data: existentes } = await db.from('outreach_emails').select('contact_id')
  const yaTienen = new Set((existentes ?? []).map((r) => r.contact_id as string))
  const { data: contactos, error } = await db.from('contacts').select(CONTACTO_COLS).eq('contact_type', 'prospect').eq('status', 'no_contact').not('email', 'is', null).order('created_at', { ascending: true }).limit(400)
  if (error) throw new Error(error.message)
  const candidatos = ((contactos ?? []) as ContactoMin[]).filter((c) => !yaTienen.has(c.id) && c.email && !(c.tags ?? []).includes('correo-invalido')).slice(0, limite)
  const creados: string[] = []
  const errores: string[] = []
  for (const c of candidatos) {
    try {
      if (await descartarSiNoRecibe(db, c)) {
        errores.push(`${c.company ?? c.email}: ${c.email} ${buzonNoComercial(c.email) ? 'es un buzón de privacidad, facturación, RH o legal' : 'está en un dominio que no recibe correo'}; se marcó como correo inválido`)
        continue
      }
      const gancho = ganchoDesdeNotas(c.notes) ?? (await ganchoConIA(c))
      const r = renderOutreach(1, { nombre: nombreDe(c), empresa: c.company ?? '', gancho, segmento: segmentoDe(c.tags) })
      const { error: e } = await db.from('outreach_emails').insert({ contact_id: c.id, step: 1, status: 'draft', campaign: campaign ?? segmentoDe(c.tags), gancho, subject: r.subject, html: r.html, text: r.text, scheduled_for: hoyLocal() })
      if (e) throw new Error(e.message)
      creados.push(c.id)
    } catch (err) {
      errores.push(`${c.company ?? c.email}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  return { creados: creados.length, errores, sinCandidatos: candidatos.length === 0 }
}

/**
 * Borrador para un contacto concreto (desde la tabla o la ficha), sin importar su estado.
 * Si ya tiene uno pendiente lo devuelve. Si ya se le escribio, solo crea el seguimiento
 * cuando se pide expresamente (`seguimiento`): el envio en lote no debe adelantar
 * seguimientos por accidente.
 */
export async function crearBorradorParaContacto(db: SupabaseClient, contactId: string, opts: { seguimiento?: boolean } = {}) {
  const { data: previos } = await db.from('outreach_emails').select('id, step, status, sent_at, gancho, campaign').eq('contact_id', contactId).order('step', { ascending: false })
  const estado = estadoDeCorreo((previos ?? []) as FilaCorreo[])
  if (estado.tipo === 'borrador') return { id: estado.borradorId, existente: true }
  if (estado.tipo === 'respondio') throw new Error('Este contacto ya respondió: contéstale desde Gmail, en el mismo hilo.')
  if (estado.tipo === 'terminado') throw new Error('Ya se le mandaron los correos de la secuencia; no hay más seguimientos.')
  if (estado.tipo === 'enviado') {
    if (!opts.seguimiento) throw new Error(`Ya se le escribió el ${fechaCorta(estado.fecha)}; su seguimiento toca el ${fechaCorta(estado.tocaEl)}.`)
    const { data: c } = await db.from('contacts').select(CONTACTO_COLS).eq('id', contactId).maybeSingle()
    if (!c) throw new Error('Contacto no encontrado')
    if ((c.tags ?? []).includes('correo-invalido')) throw new Error('El correo de este contacto está marcado como inválido')
    const primero = (previos ?? []).find((r) => r.step === 1) ?? (previos ?? [])[0]
    const gancho = ganchoDesdeNotas(primero?.gancho as string | null) ?? ganchoDesdeNotas(c.notes) ?? (await ganchoConIA(c as ContactoMin))
    const r = renderOutreach(estado.siguientePaso, { nombre: nombreDe(c), empresa: c.company ?? '', gancho, segmento: segmentoDe(c.tags) })
    const { data, error } = await db.from('outreach_emails').insert({ contact_id: c.id, step: estado.siguientePaso, status: 'draft', campaign: primero?.campaign ?? segmentoDe(c.tags), gancho, subject: r.subject, html: r.html, text: r.text, scheduled_for: hoyLocal() }).select('id').single()
    if (error) throw new Error(error.message)
    return { id: data.id as string, existente: false, seguimiento: estado.siguientePaso - 1, adelantado: estado.tocaEl > hoyLocal() ? estado.tocaEl : null }
  }
  const { data: c } = await db.from('contacts').select(CONTACTO_COLS).eq('id', contactId).maybeSingle()
  if (!c) throw new Error('Contacto no encontrado')
  if (!c.email) throw new Error('El contacto no tiene correo')
  if ((c.tags ?? []).includes('correo-invalido')) throw new Error('El correo de este contacto está marcado como inválido')
  if (await descartarSiNoRecibe(db, c as ContactoMin)) throw new Error(buzonNoComercial(c.email) ? `${c.email} es un buzón de privacidad, facturación, RH o legal, no de ventas. Lo marqué como correo inválido; escríbele por redes si tiene.` : `El dominio de ${c.email} no existe o no recibe correo. Lo marqué como correo inválido; escríbele por redes si tiene.`)
  const gancho = ganchoDesdeNotas(c.notes) ?? (await ganchoConIA(c as ContactoMin))
  const r = renderOutreach(1, { nombre: nombreDe(c), empresa: c.company ?? '', gancho, segmento: segmentoDe(c.tags) })
  const { data, error } = await db.from('outreach_emails').insert({ contact_id: c.id, step: 1, status: 'draft', campaign: segmentoDe(c.tags), gancho, subject: r.subject, html: r.html, text: r.text, scheduled_for: hoyLocal() }).select('id').single()
  if (error) throw new Error(error.message)
  return { id: data.id as string, existente: false }
}

/** Envia un borrador por Gmail, lo registra en el CRM y agenda el siguiente paso. */
export async function enviarBorrador(db: SupabaseClient, userId: string, id: string) {
  const { data: row } = await db.from('outreach_emails').select('*').eq('id', id).maybeSingle()
  if (!row) throw new Error('Borrador no encontrado')
  if (row.status !== 'draft') throw new Error('Este correo ya no es un borrador')
  const est = await estadoCampana(db)
  if (est.restanHoy <= 0) throw new Error(`Ya mandaste ${est.enviadosHoy} hoy; el tope de hoy es ${est.tope}. Mañana sigues.`)
  const { data: c } = await db.from('contacts').select(CONTACTO_COLS).eq('id', row.contact_id).maybeSingle()
  if (!c?.email) throw new Error('El contacto no tiene correo')

  // Seguimientos: en el mismo hilo que el primer correo.
  let inReplyTo: string | null = null
  let threadId: string | null = null
  if (row.step > 1) {
    const { data: previo } = await db.from('outreach_emails').select('gmail_message_id, gmail_thread_id').eq('contact_id', row.contact_id).eq('step', row.step - 1).maybeSingle()
    if (previo?.gmail_message_id) {
      threadId = previo.gmail_thread_id
      inReplyTo = await messageIdHeader(userId, previo.gmail_message_id)
    }
  }
  const { data: cuenta } = await db.from('gmail_accounts').select('email').eq('user_id', userId).maybeSingle()
  if (!cuenta) throw new Error('No hay una cuenta de Gmail conectada')
  const raw = construirMime({ from: `Brandon García · imSoft <${cuenta.email}>`, to: c.email, subject: row.subject, text: row.text, html: row.html, inReplyTo })
  const enviado = await enviarRaw(userId, raw, threadId)
  const ahora = new Date()
  await db.from('outreach_emails').update({ status: 'sent', sent_at: ahora.toISOString(), sent_via: 'gmail', gmail_message_id: enviado.id, gmail_thread_id: enviado.threadId, updated_at: ahora.toISOString() }).eq('id', id)
  await db.from('contact_emails').insert({ contact_id: row.contact_id, status: 'sent', subject: row.subject, body: row.html, sent_at: ahora.toISOString(), sent_by: userId })
  await db.from('contacts').update({ status: 'qualification', updated_at: ahora.toISOString() }).eq('id', row.contact_id).eq('status', 'no_contact')
  return { id: enviado.id, threadId: enviado.threadId, siguiente: row.step < 3 ? fechaSiguientePaso(ahora, (row.step + 1) as 2 | 3) : null }
}

/**
 * El borrador se mando fuera del sistema (copiado a Gmail, WhatsApp...): se registra como
 * enviado a mano con el mismo efecto que el envio por Gmail, salvo el hilo (no lo hay).
 */
export async function marcarEnviadoAMano(db: SupabaseClient, userId: string, id: string) {
  const { data: row } = await db.from('outreach_emails').select('*').eq('id', id).maybeSingle()
  if (!row) throw new Error('Borrador no encontrado')
  if (row.status !== 'draft') throw new Error('Este correo ya no es un borrador')
  const ahora = new Date()
  await db.from('outreach_emails').update({ status: 'sent', sent_at: ahora.toISOString(), sent_via: 'manual', updated_at: ahora.toISOString() }).eq('id', id)
  await db.from('contact_emails').insert({ contact_id: row.contact_id, status: 'sent', subject: row.subject, body: row.html, sent_at: ahora.toISOString(), sent_by: userId })
  await db.from('contacts').update({ status: 'qualification', updated_at: ahora.toISOString() }).eq('id', row.contact_id).eq('status', 'no_contact')
  return { siguiente: row.step < 3 ? fechaSiguientePaso(ahora, (row.step + 1) as 2 | 3) : null }
}

/**
 * Mensaje de prospeccion para una red social. El gancho es el mismo del correo: si ya
 * hay uno guardado en outreach_emails se reutiliza; si no, notas del CRM o la IA.
 * Con oferta de app propia no se reutiliza el del correo: ese habla de procesos internos
 * y aqui el mensaje va del lado del cliente final.
 */
export async function mensajeParaRed(db: SupabaseClient, contactId: string, canal: Canal) {
  const { data: c } = await db.from('contacts').select(CONTACTO_COLS).eq('id', contactId).maybeSingle()
  if (!c) throw new Error('Contacto no encontrado')
  const { data: previo } = await db.from('outreach_emails').select('gancho').eq('contact_id', contactId).eq('step', 1).not('gancho', 'is', null).maybeSingle()
  const oferta = ofertaDe(c.tags)
  const gancho = (oferta ? null : (previo?.gancho as string | null)) || ganchoDesdeNotas(c.notes) || (await ganchoConIA(c as ContactoMin, oferta))
  return { texto: renderMensajeRed(canal, { nombre: nombreDe(c), empresa: c.company ?? '', gancho, segmento: segmentoDe(c.tags), oferta }), gancho }
}

/** Mensajes por redes registrados hoy (hora de Guadalajara) y en los ultimos 7 dias, por canal. */
export async function mensajesDeRedes(db: SupabaseClient) {
  const hoy = hoyLocal()
  const inicioHoy = new Date(`${hoy}T00:00:00-06:00`)
  const hace7 = new Date(inicioHoy.getTime() - 6 * 86_400_000)
  const { data } = await db.from('activities').select('subject, completed_at').like('subject', 'Mensaje por %').gte('completed_at', hace7.toISOString()).limit(2000)
  const filas = data ?? []
  return {
    hoy: conteoPorCanal(filas.filter((f) => new Date(f.completed_at as string) >= inicioHoy).map((f) => f.subject as string)),
    semana: conteoPorCanal(filas.map((f) => f.subject as string)),
    topes: TOPE_DIARIO_CANAL,
  }
}

/**
 * Prospectos sin contactar a los que se les puede escribir por WhatsApp o Instagram, en el
 * orden en que conviene atenderlos. `total` es cuantos hay en la cola; `filas` trae a lo mas `limite`.
 */
export async function prospectosParaRedes(db: SupabaseClient, limite = 25): Promise<{ filas: FilaCola[]; total: number }> {
  const { data } = await db
    .from('contacts')
    .select('id, first_name, last_name, company, email, phone, instagram_url, social_links, tags')
    .eq('contact_type', 'prospect')
    .eq('status', 'no_contact')
    .order('created_at', { ascending: true })
    .limit(1000)
  const cola = colaDeRedes((data ?? []) as ContactoDeCola[])
  return { filas: cola.slice(0, limite), total: cola.length }
}

/** El mensaje ya se mando por la red: queda en el historial y el prospecto pasa a calificacion. */
export async function registrarMensajeRed(db: SupabaseClient, userId: string, contactId: string, canal: Canal, texto: string, etiqueta: string) {
  const ahora = new Date().toISOString()
  const { error } = await db.from('activities').insert({ contact_id: contactId, activity_type: 'note', subject: `Mensaje por ${etiqueta}`, description: texto, status: 'completed', completed_at: ahora, created_by: userId })
  if (error) throw new Error(error.message)
  await db.from('contacts').update({ status: 'qualification', updated_at: ahora }).eq('id', contactId).eq('status', 'no_contact')
  return { ok: true }
}

/** Reconstruye asunto, texto y html a partir del cuerpo editado. */
export async function editarBorrador(db: SupabaseClient, id: string, cambios: { subject?: string; cuerpo?: string; scheduled_for?: string }) {
  const { data: row } = await db.from('outreach_emails').select('id, step, status, subject, text, contact_id').eq('id', id).maybeSingle()
  if (!row) throw new Error('Borrador no encontrado')
  if (row.status !== 'draft') throw new Error('Solo se editan borradores')
  const { data: c } = await db.from('contacts').select('company').eq('id', row.contact_id).maybeSingle()
  const r = renderDesdeCuerpo(row.step as Step, { subject: cambios.subject ?? row.subject, cuerpo: cambios.cuerpo ?? cuerpoDe(row.text), empresa: c?.company ?? '' })
  const upd: Record<string, unknown> = { subject: r.subject, text: r.text, html: r.html, updated_at: new Date().toISOString() }
  if (cambios.scheduled_for && /^\d{4}-\d{2}-\d{2}$/.test(cambios.scheduled_for)) upd.scheduled_for = cambios.scheduled_for
  const { error } = await db.from('outreach_emails').update(upd).eq('id', id)
  if (error) throw new Error(error.message)
  return r
}

/**
 * 1) Revisa en Gmail si contestaron los hilos abiertos y cierra esos contactos.
 * 2) Crea los borradores de seguimiento que ya tocan (4 y 6 dias habiles).
 * 3) Cierra los que ya recibieron los 3 correos sin respuesta.
 */
export async function sincronizar(db: SupabaseClient, userId: string) {
  const res = { respondieron: 0, rebotaron: 0, seguimientosCreados: 0, cerrados: 0, errores: [] as string[] }
  const { data: enviados } = await db.from('outreach_emails').select('*').eq('status', 'sent').order('sent_at', { ascending: true })
  const porContacto = new Map<string, typeof enviados>()
  for (const r of enviados ?? []) porContacto.set(r.contact_id, [...(porContacto.get(r.contact_id) ?? []), r])

  // Rebotes que llegaron como correo aparte (fuera del hilo) o de envios hechos a mano.
  try {
    const fallidos = await rebotesRecientes(userId)
    if (fallidos.length) {
      const { data: afectados } = await db.from('contacts').select('id, email, tags').in('email', fallidos)
      for (const c of afectados ?? []) {
        if (((c.tags as string[] | null) ?? []).includes('correo-invalido')) continue
        await marcarRebote(db, c.id as string, c.tags as string[] | null)
        porContacto.delete(c.id as string)
        res.rebotaron += 1
      }
    }
  } catch (err) {
    res.errores.push(`rebotes: ${err instanceof Error ? err.message : String(err)}`)
  }

  const { data: contactos } = await db.from('contacts').select(CONTACTO_COLS).in('id', [...porContacto.keys()].length ? [...porContacto.keys()] : ['00000000-0000-0000-0000-000000000000'])
  const contactoDe = new Map(((contactos ?? []) as ContactoMin[]).map((c) => [c.id, c]))
  const hoy = hoyLocal()

  for (const [contactId, filas] of porContacto) {
    const ultimo = filas![filas!.length - 1]
    try {
      const hilo = filas!.find((f) => f.gmail_thread_id)?.gmail_thread_id as string | undefined
      const estado = hilo ? await estadoDelHilo(userId, hilo) : null
      if (estado === 'rebote') {
        await marcarRebote(db, contactId, contactoDe.get(contactId)?.tags ?? null)
        res.rebotaron += 1
        continue
      }
      if (estado === 'respuesta') {
        const ahora = new Date().toISOString()
        await db.from('outreach_emails').update({ status: 'replied', replied_at: ahora, updated_at: ahora }).eq('contact_id', contactId).eq('status', 'sent')
        await db.from('outreach_emails').update({ status: 'skipped', updated_at: ahora }).eq('contact_id', contactId).eq('status', 'draft')
        res.respondieron += 1
        continue
      }
      if (ultimo.step >= 3) {
        if (fechaSiguientePaso(new Date(ultimo.sent_at), 3) <= hoy) {
          await db.from('outreach_emails').update({ status: 'closed', updated_at: new Date().toISOString() }).eq('contact_id', contactId).eq('status', 'sent')
          res.cerrados += 1
        }
        continue
      }
      const siguiente = (ultimo.step + 1) as 2 | 3
      const toca = fechaSiguientePaso(new Date(ultimo.sent_at), siguiente)
      if (toca > hoy) continue
      const { data: yaHay } = await db.from('outreach_emails').select('id').eq('contact_id', contactId).eq('step', siguiente).maybeSingle()
      if (yaHay) continue
      const c = contactoDe.get(contactId)
      if (!c) continue
      const gancho = ganchoDesdeNotas(filas![0].gancho as string | null) ?? ganchoDesdeNotas(c.notes) ?? (await ganchoConIA(c))
      const r = renderOutreach(siguiente, { nombre: nombreDe(c), empresa: c.company ?? '', gancho, segmento: segmentoDe(c.tags) })
      const { error } = await db.from('outreach_emails').insert({ contact_id: contactId, step: siguiente, status: 'draft', campaign: filas![0].campaign, gancho, subject: r.subject, html: r.html, text: r.text, scheduled_for: toca })
      if (error) throw new Error(error.message)
      res.seguimientosCreados += 1
    } catch (err) {
      res.errores.push(`${contactoDe.get(contactId)?.company ?? contactId}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  return res
}

/**
 * El correo del contacto no existe: se cierra su secuencia, se descartan sus borradores y
 * se etiqueta `correo-invalido`, que lo saca de futuros borradores. Sigue en el CRM por si
 * tiene Instagram o telefono.
 */
export async function marcarRebote(db: SupabaseClient, contactId: string, tags: string[] | null) {
  const ahora = new Date().toISOString()
  await db.from('outreach_emails').update({ status: 'closed', updated_at: ahora }).eq('contact_id', contactId).in('status', ['sent', 'replied'])
  await db.from('outreach_emails').update({ status: 'skipped', updated_at: ahora }).eq('contact_id', contactId).eq('status', 'draft')
  const nuevas = [...new Set([...(tags ?? []), 'correo-invalido'])]
  const { data: c } = await db.from('contacts').select('email, invalid_emails').eq('id', contactId).maybeSingle()
  const invalidos = [...new Set([...((c?.invalid_emails as string[] | null) ?? []), ...(c?.email ? [String(c.email).toLowerCase()] : [])])]
  await db.from('contacts').update({ tags: nuevas, invalid_emails: invalidos, updated_at: ahora }).eq('id', contactId)
}

/** Registra como enviados a mano (paso 1) los contactos que ya se contactaron fuera del sistema. */
export async function registrarEnviadosAMano(db: SupabaseClient, contactIds: string[], sentAt: string) {
  const { data: contactos } = await db.from('contacts').select(CONTACTO_COLS).in('id', contactIds)
  let creados = 0
  for (const c of (contactos ?? []) as ContactoMin[]) {
    const gancho = ganchoDesdeNotas(c.notes) ?? ''
    const r = renderOutreach(1, { nombre: nombreDe(c), empresa: c.company ?? '', gancho, segmento: segmentoDe(c.tags) })
    const { error } = await db.from('outreach_emails').upsert({ contact_id: c.id, step: 1, status: 'sent', campaign: segmentoDe(c.tags), gancho, subject: r.subject, html: r.html, text: r.text, scheduled_for: sentAt.slice(0, 10), sent_at: sentAt, sent_via: 'manual' }, { onConflict: 'contact_id,step', ignoreDuplicates: true })
    if (!error) creados += 1
  }
  return { creados }
}
