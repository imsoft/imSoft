/**
 * Builds the Supabase Auth email templates with the imSoft design
 * (src/lib/email/layout.ts). Supabase stores them in its dashboard, not here: this script
 * only outputs the HTML to supabase/templates/ to be copied into
 * Authentication > Email Templates.
 *
 * Usage: node --experimental-strip-types scripts/build-auth-emails.mjs
 */
import { writeFileSync } from 'node:fs'
import { button, callout, emailLayout, paragraph } from '../src/lib/email/layout.ts'

// The layout only accepts http(s) URLs: a marker is used and later swapped for the Supabase variable.
const URL_MARKER = 'https://imsoft-confirmation-url.invalid/'
const withVariables = (html) =>
  html
    .replaceAll(URL_MARKER, '{{ .ConfirmationURL }}')
    .replaceAll('__EMAIL__', '{{ .Email }}')
    .replaceAll('__NEW_EMAIL__', '{{ .NewEmail }}')
    .replaceAll('__TOKEN__', '{{ .Token }}')

const footer = ['Si no pediste esto, ignora este correo: tu cuenta sigue segura.']
const note = paragraph('Si el botón no funciona, copia y pega este enlace en tu navegador:', { muted: true, small: true }) +
  `<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#6b7280;word-break:break-all">${URL_MARKER}</p>`

const templates = [
  {
    file: 'confirm-signup',
    panel: 'Confirm signup',
    subject: 'Confirma tu cuenta en imSoft',
    html: emailLayout({
      preheader: 'Un clic para activar tu cuenta.',
      label: 'Bienvenido a imSoft',
      title: 'Confirma tu correo',
      body: paragraph('Gracias por crear tu cuenta. Confirma que este correo es tuyo para entrar a tu panel, donde verás tus proyectos, avances y pagos.') + button('Confirmar mi cuenta', URL_MARKER) + note,
      footer,
    }),
  },
  {
    file: 'invite',
    panel: 'Invite user',
    subject: 'Te invitaron a imSoft',
    html: emailLayout({
      preheader: 'Crea tu contraseña y entra a tu panel.',
      label: 'Invitación',
      title: 'Tienes acceso a tu panel de imSoft',
      body: paragraph('Te dimos acceso al panel de imSoft para que sigas tu proyecto: tareas, avances, entregables y pagos, todo en un lugar.') + paragraph('Solo falta que crees tu contraseña.') + button('Aceptar invitación', URL_MARKER) + note,
      footer: ['Si no esperabas esta invitación, ignora este correo.'],
    }),
  },
  {
    file: 'magic-link',
    panel: 'Magic Link',
    subject: 'Tu enlace para entrar a imSoft',
    html: emailLayout({
      preheader: 'Entra con un clic, sin contraseña.',
      label: 'Inicio de sesión',
      title: 'Entra a tu cuenta',
      body: paragraph('Usa este botón para entrar a imSoft sin contraseña. El enlace sirve una sola vez y caduca en una hora.') + button('Entrar a imSoft', URL_MARKER) + note,
      footer,
    }),
  },
  {
    file: 'change-email',
    panel: 'Change Email Address',
    subject: 'Confirma tu nuevo correo en imSoft',
    html: emailLayout({
      preheader: 'Confirma el cambio de correo de tu cuenta.',
      label: 'Cambio de correo',
      title: 'Confirma tu nuevo correo',
      body: paragraph('Pediste cambiar el correo de tu cuenta de imSoft:') +
        callout('De <strong>__EMAIL__</strong><br>a <strong>__NEW_EMAIL__</strong>') +
        button('Confirmar el cambio', URL_MARKER) + note,
      footer: ['Si no pediste este cambio, ignora este correo y escríbenos a soporte@imsoft.io.'],
    }),
  },
  {
    file: 'reset-password',
    panel: 'Reset Password',
    subject: 'Restablece tu contraseña de imSoft',
    html: emailLayout({
      preheader: 'Crea una contraseña nueva para tu cuenta.',
      label: 'Contraseña',
      title: 'Restablece tu contraseña',
      body: paragraph('Recibimos una solicitud para cambiar la contraseña de tu cuenta de imSoft. Crea una nueva con este botón; el enlace caduca en una hora.') + button('Crear contraseña nueva', URL_MARKER) + note,
      footer: ['Si no pediste este cambio, ignora este correo: tu contraseña sigue siendo la misma.'],
    }),
  },
  {
    file: 'reauthentication',
    panel: 'Reauthentication',
    subject: 'Tu código de verificación de imSoft',
    html: emailLayout({
      preheader: 'Tu código para confirmar la acción.',
      label: 'Verificación',
      title: 'Confirma que eres tú',
      body: paragraph('Para continuar, escribe este código en imSoft:') +
        `<p style="margin:0 0 20px;padding:18px;background:#e8f2fd;border-radius:10px;text-align:center;font-family:Menlo,Consolas,monospace;font-size:32px;font-weight:bold;letter-spacing:8px;color:#1565c0">__TOKEN__</p>` +
        paragraph('El código caduca en unos minutos.', { muted: true, small: true }),
      footer,
    }),
  },
]

const index = ['# Plantillas de correo de Supabase Auth', '', 'Generadas con `node --experimental-strip-types scripts/build-auth-emails.mjs`.', 'Se pegan a mano en Supabase: Authentication > Email Templates.', '', '| Plantilla en Supabase | Asunto | Archivo |', '|---|---|---|']
for (const t of templates) {
  const html = withVariables(t.html)
  writeFileSync(new URL(`../supabase/templates/${t.file}.html`, import.meta.url), html)
  index.push(`| ${t.panel} | ${t.subject} | \`${t.file}.html\` |`)
}
writeFileSync(new URL('../supabase/templates/README.md', import.meta.url), index.join('\n') + '\n')
console.log(`${templates.length} templates en supabase/templates/`)
