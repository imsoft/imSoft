import { NextRequest, NextResponse } from 'next/server'
import { getResend } from '@/lib/email/resend-client'
import { blogNotifyFailedEmail } from '@/lib/email/templates';
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildBlogNotificationHtml } from '@/lib/email/blog-notification-template'
import { buildUnsubscribeUrl } from '@/lib/email/unsubscribe'
import { isAdmin } from '@/lib/roles'


// Resend accepts up to 100 emails per batch in batch.send().
const BATCH_SIZE = 100

interface Recipient {
  id: string
  email: string
  name: string
}

/**
 * Sends the new blog article notice to every confirmed and subscribed user
 * (soft opt-in model: only those who unsubscribed are excluded).
 *
 * Guarantees:
 *  - Idempotent: if the post already has notification_sent_at, it doesn't resend.
 *  - Pre-flight: validates config and data BEFORE sending; if anything fails, no
 *    email goes out to users.
 *  - On any error, notifies the admin (not the users).
 */
export async function POST(request: NextRequest) {
  let postTitle = ''
  try {
    // ---- Auth: admins only ----
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { postId, lang = 'es' } = body as { postId?: string; lang?: string }
    if (!postId) {
      return NextResponse.json({ error: 'postId requerido' }, { status: 400 })
    }

    // ---- Pre-flight: configuration ----
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY no está configurada')
    }
    if (!process.env.EMAIL_UNSUBSCRIBE_SECRET) {
      throw new Error('EMAIL_UNSUBSCRIBE_SECRET no está configurada')
    }
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'contacto@imsoft.io'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const admin = createAdminClient()

    // ---- Load the article and check idempotency ----
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
      // Not an error: a draft simply isn't announced.
      return NextResponse.json({ skipped: true, reason: 'not_published' })
    }
    if (post.notification_sent_at) {
      // Idempotency lock: already sent before.
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

    // ---- Physical address for the footer (CAN-SPAM) ----
    const { data: contactData } = await admin
      .from('contact')
      .select('address')
      .limit(1)
      .maybeSingle()
    const companyAddress = contactData?.address || null

    // ---- Build the recipient list (paginated) ----
    const recipients: Recipient[] = []
    const seen = new Set<string>()
    let page = 1
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
        // Confirmed humans only.
        if (!u.email_confirmed_at) continue
        // Soft opt-in: only those who explicitly unsubscribed are excluded.
        if (u.user_metadata?.email_opt_in === false) continue
        // We don't send the newsletter to ourselves (admins).
        if (isAdmin(u)) continue

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
      // Nothing to send: mark as notified so it isn't retried in vain.
      await admin.from('blog').update({ notification_sent_at: new Date().toISOString() }).eq('id', post.id)
      return NextResponse.json({ sent: 0, reason: 'no_recipients' })
    }

    // ---- Batch sending (if a batch fails, we stop) ----
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

      const { error: sendError } = await getResend().batch.send(emails)
      if (sendError) {
        // Stop sending right away and report to the admin.
        throw new Error(
          `Falló el envío en el lote ${start / BATCH_SIZE + 1} (${sent} enviados antes del fallo): ${sendError.message}`
        )
      }
      sent += chunk.length
    }

    // ---- Mark as notified (idempotency) ----
    await admin.from('blog').update({ notification_sent_at: new Date().toISOString() }).eq('id', post.id)

    return NextResponse.json({ sent, total: recipients.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    console.error('[blog/notify] Error:', message)

    // Notify the admin (not the users) so it can be diagnosed.
    await notifyAdminOfError(postTitle, message)

    return NextResponse.json({ error: 'Error al enviar las notificaciones', details: message }, { status: 500 })
  }
}

/** Emails the admin the failure details. Never throws. */
async function notifyAdminOfError(postTitle: string, message: string) {
  try {
    if (!process.env.RESEND_API_KEY) return
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'contacto@imsoft.io'
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'weareimsoft@gmail.com'

    await getResend().emails.send({
      from: `imSoft <${fromEmail}>`,
      to: [adminEmail],
      ...blogNotifyFailedEmail({ title: postTitle, error: message }),
    })
  } catch (e) {
    console.error('[blog/notify] No se pudo avisar al admin del error:', e)
  }
}
