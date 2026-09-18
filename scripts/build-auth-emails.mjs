/**
 * Genera las plantillas de correo de Supabase Auth con el diseño de imSoft
 * (src/lib/email/layout.ts). Supabase las guarda en su panel, no aqui: este script
 * solo produce el HTML en supabase/templates/ para copiarlo en
 * Authentication > Email Templates.
 *
 * Uso: node --experimental-strip-types scripts/build-auth-emails.mjs
 */
import { writeFileSync } from 'node:fs'
import { boton, destacado, emailLayout, parrafo } from '../src/lib/email/layout.ts'

// El layout solo acepta URLs http(s): se usa un marcador y luego se cambia por la variable de Supabase.
const URL_MARCA = 'https://imsoft-confirmation-url.invalid/'
const conVariables = (html) =>
  html
    .replaceAll(URL_MARCA, '{{ .ConfirmationURL }}')
    .replaceAll('__EMAIL__', '{{ .Email }}')
    .replaceAll('__NEW_EMAIL__', '{{ .NewEmail }}')
    .replaceAll('__TOKEN__', '{{ .Token }}')

const pie = ['Si no pediste esto, ignora este correo: tu cuenta sigue segura.']
const nota = parrafo('Si el botón no funciona, copia y pega este enlace en tu navegador:', { tenue: true, chico: true }) +
  `<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#6b7280;word-break:break-all">${URL_MARCA}</p>`

const plantillas = [
  {
    archivo: 'confirmar-registro',
    panel: 'Confirm signup',
    asunto: 'Confirma tu cuenta en imSoft',
    html: emailLayout({
      preheader: 'Un clic para activar tu cuenta.',
      etiqueta: 'Bienvenido a imSoft',
      titulo: 'Confirma tu correo',
      cuerpo: parrafo('Gracias por crear tu cuenta. Confirma que este correo es tuyo para entrar a tu panel, donde verás tus proyectos, avances y pagos.') + boton('Confirmar mi cuenta', URL_MARCA) + nota,
      pie,
    }),
  },
  {
    archivo: 'invitacion',
    panel: 'Invite user',
    asunto: 'Te invitaron a imSoft',
    html: emailLayout({
      preheader: 'Crea tu contraseña y entra a tu panel.',
      etiqueta: 'Invitación',
      titulo: 'Tienes acceso a tu panel de imSoft',
      cuerpo: parrafo('Te dimos acceso al panel de imSoft para que sigas tu proyecto: tareas, avances, entregables y pagos, todo en un lugar.') + parrafo('Solo falta que crees tu contraseña.') + boton('Aceptar invitación', URL_MARCA) + nota,
      pie: ['Si no esperabas esta invitación, ignora este correo.'],
    }),
  },
  {
    archivo: 'enlace-magico',
    panel: 'Magic Link',
    asunto: 'Tu enlace para entrar a imSoft',
    html: emailLayout({
      preheader: 'Entra con un clic, sin contraseña.',
      etiqueta: 'Inicio de sesión',
      titulo: 'Entra a tu cuenta',
      cuerpo: parrafo('Usa este botón para entrar a imSoft sin contraseña. El enlace sirve una sola vez y caduca en una hora.') + boton('Entrar a imSoft', URL_MARCA) + nota,
      pie,
    }),
  },
  {
    archivo: 'cambio-de-correo',
    panel: 'Change Email Address',
    asunto: 'Confirma tu nuevo correo en imSoft',
    html: emailLayout({
      preheader: 'Confirma el cambio de correo de tu cuenta.',
      etiqueta: 'Cambio de correo',
      titulo: 'Confirma tu nuevo correo',
      cuerpo: parrafo('Pediste cambiar el correo de tu cuenta de imSoft:') +
        destacado('De <strong>__EMAIL__</strong><br>a <strong>__NEW_EMAIL__</strong>') +
        boton('Confirmar el cambio', URL_MARCA) + nota,
      pie: ['Si no pediste este cambio, ignora este correo y escríbenos a soporte@imsoft.io.'],
    }),
  },
  {
    archivo: 'recuperar-contrasena',
    panel: 'Reset Password',
    asunto: 'Restablece tu contraseña de imSoft',
    html: emailLayout({
      preheader: 'Crea una contraseña nueva para tu cuenta.',
      etiqueta: 'Contraseña',
      titulo: 'Restablece tu contraseña',
      cuerpo: parrafo('Recibimos una solicitud para cambiar la contraseña de tu cuenta de imSoft. Crea una nueva con este botón; el enlace caduca en una hora.') + boton('Crear contraseña nueva', URL_MARCA) + nota,
      pie: ['Si no pediste este cambio, ignora este correo: tu contraseña sigue siendo la misma.'],
    }),
  },
  {
    archivo: 'reautenticacion',
    panel: 'Reauthentication',
    asunto: 'Tu código de verificación de imSoft',
    html: emailLayout({
      preheader: 'Tu código para confirmar la acción.',
      etiqueta: 'Verificación',
      titulo: 'Confirma que eres tú',
      cuerpo: parrafo('Para continuar, escribe este código en imSoft:') +
        `<p style="margin:0 0 20px;padding:18px;background:#e8f2fd;border-radius:10px;text-align:center;font-family:Menlo,Consolas,monospace;font-size:32px;font-weight:bold;letter-spacing:8px;color:#1565c0">__TOKEN__</p>` +
        parrafo('El código caduca en unos minutos.', { tenue: true, chico: true }),
      pie,
    }),
  },
]

const indice = ['# Plantillas de correo de Supabase Auth', '', 'Generadas con `node --experimental-strip-types scripts/build-auth-emails.mjs`.', 'Se pegan a mano en Supabase: Authentication > Email Templates.', '', '| Plantilla en Supabase | Asunto | Archivo |', '|---|---|---|']
for (const p of plantillas) {
  const html = conVariables(p.html)
  writeFileSync(new URL(`../supabase/templates/${p.archivo}.html`, import.meta.url), html)
  indice.push(`| ${p.panel} | ${p.asunto} | \`${p.archivo}.html\` |`)
}
writeFileSync(new URL('../supabase/templates/README.md', import.meta.url), indice.join('\n') + '\n')
console.log(`${plantillas.length} plantillas en supabase/templates/`)
