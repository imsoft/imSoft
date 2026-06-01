import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildBlogNotificationHtml } from '@/lib/email/blog-notification-template'
import { buildUnsubscribeUrl } from '@/lib/email/unsubscribe'

const resend = new Resend(process.env.RESEND_API_KEY)

// Resend acepta hasta 100 correos por lote en batch.send().
const BATCH_SIZE = 100

interface Recipient {
  id: string
  email: string
  name: string
}

/**
 * Envía el aviso de un nuevo artículo del blog a todos los usuarios confirmados
 * y suscritos (modelo soft opt-in: solo se excluye a quien se dio de baja).
 *
 * Garantías:
 *  - Idempotente: si el post ya tiene notification_sent_at, no reenvía.
 *  - Pre-flight: valida config y datos ANTES de enviar; si algo falla, no sale
 *    ningún correo a los usuarios.
 *  - Ante cualquier error, notifica al admin (no a los usuarios).
 */
export async function POST(request: NextRequest) {
  let postTitle = ''
  try {
    // ---- Autenticación: solo admins ----
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { postId, lang = 'es' } = body as { postId?: string; lang?: string }
    if (!postId) {
      return NextResponse.json({ error: 'postId requerido' }, { status: 400 })
    }

    // ---- Pre-flight: configuración ----
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY no está configurada')
    }
    if (!process.env.EMAIL_UNSUBSCRIBE_SECRET) {
      throw new Error('EMAIL_UNSUBSCRIBE_SECRET no está configurada')
    }
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'contacto@imsoft.io'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const admin = createAdminClient()

    // ---- Cargar el artículo y validar idempotencia ----
    const { data: post, error: postError } = await admin
      .from('blog')
      .select('id, slug, title_es, title_en, title, excerpt_es, excerpt_en, excerpt, image_url, published, notification_sent_at')
      .eq('id', postId)
      .maybeSingle()

    if (postError) throw new Error(`Error leyendo el artículo: ${postError.message}`)
    if (!post) {
      return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 })
    }
    if (!post.published) {
      // No es un error: simplemente no se notifica un borrador.
      return NextResponse.json({ skipped: true, reason: 'not_published' })
    }
    if (post.notification_sent_at) {
      // Candado de idempotencia: ya se envió antes.
      return NextResponse.json({ skipped: true, reason: 'already_sent' })
    }

    postTitle =
      (lang === 'en' ? post.title_en : post.title_es) ||
      post.title_es ||
      post.title_en ||
      post.title ||
      'Nuevo artículo'
    const postExcerpt =
      (lang === 'en' ? post.excerpt_en : post.excerpt_es) ||
      post.excerpt_es ||
      post.excerpt_en ||
      post.excerpt ||
      null
    const postUrl = `${siteUrl}/${lang}/blog/${post.slug}`

    // ---- Dirección física para el pie (CAN-SPAM) ----
    const { data: contactData } = await admin
      .from('contact')
      .select('address')
      .limit(1)
      .maybeSingle()
    const companyAddress = contactData?.address || null

    // ---- Construir la lista de destinatarios (paginado) ----
    const recipients: Recipient[] = []
    const seen = new Set<string>()
    let page = 1
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
        page,
        perPage: 1000,
      })
      if (usersError) throw new Error(`Error listando usuarios: ${usersError.message}`)

      const batch = usersData?.users ?? []
      if (batch.length === 0) break

      for (const u of batch) {
        const email = u.email?.trim().toLowerCase()
        if (!email || seen.has(email)) continue
        // Solo humanos confirmados.
        if (!u.email_confirmed_at) continue
        // Soft opt-in: se excluye únicamente a quien explícitamente se dio de baja.
        if (u.user_metadata?.email_opt_in === false) continue
        // No nos enviamos la newsletter a nosotros mismos (admins).
        if (u.user_metadata?.role === 'admin') continue

        seen.add(email)
        recipients.push({
          id: u.id,
          email,
          name:
            u.user_metadata?.first_name ||
            u.user_metadata?.full_name?.split(' ')?.[0] ||
            email.split('@')[0],
        })
      }

      if (batch.length < 1000) break
      page += 1
    }

    if (recipients.length === 0) {
      // Nada que enviar: marcamos como notificado para no reintentar en vano.
      await admin.from('blog').update({ notification_sent_at: new Date().toISOString() }).eq('id', post.id)
      return NextResponse.json({ sent: 0, reason: 'no_recipients' })
    }

    // ---- Envío por lotes (si el primer lote falla, no continuamos) ----
    let sent = 0
    for (let start = 0; start < recipients.length; start += BATCH_SIZE) {
      const chunk = recipients.slice(start, start + BATCH_SIZE)
      const emails = chunk.map((r) => ({
        from: `imSoft <${fromEmail}>`,
        to: [r.email],
        subject: postTitle,
        html: buildBlogNotificationHtml({
          recipientName: r.name,
          postTitle,
          postExcerpt,
          postImageUrl: post.image_url,
          postUrl,
          unsubscribeUrl: buildUnsubscribeUrl(r.id, lang),
          companyAddress,
          lang,
        }),
      }))

      const { error: sendError } = await resend.batch.send(emails)
      if (sendError) {
        // Detenemos el envío inmediatamente y reportamos al admin.
        throw new Error(
          `Falló el envío en el lote ${start / BATCH_SIZE + 1} (${sent} enviados antes del fallo): ${sendError.message}`
        )
      }
      sent += chunk.length
    }

    // ---- Marcar como notificado (idempotencia) ----
    await admin.from('blog').update({ notification_sent_at: new Date().toISOString() }).eq('id', post.id)

    return NextResponse.json({ sent, total: recipients.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    console.error('[blog/notify] Error:', message)

    // Notificar al admin (no a los usuarios) para poder diagnosticar.
    await notifyAdminOfError(postTitle, message)

    return NextResponse.json({ error: 'Error al enviar las notificaciones', details: message }, { status: 500 })
  }
}

/** Manda al admin un correo con el detalle del fallo. Nunca lanza. */
async function notifyAdminOfError(postTitle: string, message: string) {
  try {
    if (!process.env.RESEND_API_KEY) return
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'contacto@imsoft.io'
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'weareimsoft@gmail.com'

    await resend.emails.send({
      from: `imSoft <${fromEmail}>`,
      to: [adminEmail],
      subject: `⚠️ Falló el envío del aviso de blog${postTitle ? `: ${postTitle}` : ''}`,
      html: `
        <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#b91c1c;">No se enviaron las notificaciones del blog</h2>
          <p style="color:#374151;">Ningún usuario recibió correo. Detalle del error:</p>
          <pre style="background:#f3f4f6;padding:16px;border-radius:6px;color:#111827;font-size:13px;white-space:pre-wrap;word-break:break-word;">${message}</pre>
          ${postTitle ? `<p style="color:#6b7280;font-size:14px;">Artículo: <strong>${postTitle}</strong></p>` : ''}
          <p style="color:#9ca3af;font-size:12px;">Corrige el problema y vuelve a publicar/guardar el artículo para reintentar el envío.</p>
        </div>
      `,
    })
  } catch (e) {
    console.error('[blog/notify] No se pudo avisar al admin del error:', e)
  }
}
