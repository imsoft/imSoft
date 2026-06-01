interface BlogNotificationParams {
  recipientName: string
  postTitle: string
  postExcerpt?: string | null
  postImageUrl?: string | null
  postUrl: string
  unsubscribeUrl: string
  companyAddress?: string | null
  lang?: string
}

const t = (lang: string) =>
  lang === 'en'
    ? {
        preheader: 'New article on the imSoft blog',
        greeting: (name: string) => `Hi ${name}!`,
        intro: 'We just published a new article we think you’ll like:',
        cta: 'Read article',
        footerNote:
          'You receive this email because you have an account at imSoft.',
        unsubscribe: 'Unsubscribe from these emails',
        rights: 'All rights reserved.',
      }
    : {
        preheader: 'Nuevo artículo en el blog de imSoft',
        greeting: (name: string) => `¡Hola ${name}!`,
        intro: 'Acabamos de publicar un nuevo artículo que creemos te gustará:',
        cta: 'Leer artículo',
        footerNote:
          'Recibes este correo porque tienes una cuenta en imSoft.',
        unsubscribe: 'Darme de baja de estos correos',
        rights: 'Todos los derechos reservados.',
      }

/** HTML del correo de aviso de nuevo artículo del blog. */
export function buildBlogNotificationHtml(params: BlogNotificationParams): string {
  const {
    recipientName,
    postTitle,
    postExcerpt,
    postImageUrl,
    postUrl,
    unsubscribeUrl,
    companyAddress,
    lang = 'es',
  } = params
  const i = t(lang)
  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${postTitle}</title>
  </head>
  <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f3f4f6;">
    <span style="display:none;font-size:1px;color:#f3f4f6;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${i.preheader}</span>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">imSoft</h1>
              </td>
            </tr>

            ${
              postImageUrl
                ? `<tr><td style="padding:0;"><img src="${postImageUrl}" alt="${postTitle}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" /></td></tr>`
                : ''
            }

            <!-- Content -->
            <tr>
              <td style="padding:40px;">
                <h2 style="margin:0 0 16px 0;color:#111827;font-size:22px;font-weight:600;">${i.greeting(recipientName)}</h2>
                <p style="margin:0 0 20px 0;color:#4b5563;font-size:16px;line-height:1.6;">${i.intro}</p>

                <h3 style="margin:0 0 12px 0;color:#111827;font-size:20px;font-weight:700;line-height:1.3;">${postTitle}</h3>
                ${
                  postExcerpt
                    ? `<p style="margin:0 0 28px 0;color:#6b7280;font-size:15px;line-height:1.6;">${postExcerpt}</p>`
                    : ''
                }

                <table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;">
                  <tr>
                    <td align="center">
                      <a href="${postUrl}" style="display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:6px;font-weight:600;font-size:16px;">${i.cta}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f9fafb;padding:28px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="margin:0 0 8px 0;color:#6b7280;font-size:13px;line-height:1.5;">${i.footerNote}</p>
                <p style="margin:0 0 12px 0;">
                  <a href="${unsubscribeUrl}" style="color:#667eea;font-size:13px;text-decoration:underline;">${i.unsubscribe}</a>
                </p>
                <p style="margin:0 0 4px 0;color:#9ca3af;font-size:12px;">© ${year} imSoft. ${i.rights}</p>
                ${
                  companyAddress
                    ? `<p style="margin:0;color:#9ca3af;font-size:12px;">${companyAddress}</p>`
                    : ''
                }
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
