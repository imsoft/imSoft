/**
 * Imprime un codigo de un solo uso para entrar a la app movil con una cuenta, sin pasar
 * por el correo ni por el limite de /api/app/login. Sirve para tomar capturas:
 *
 *   pnpm app:codigo                      # cuenta demo-app@imsoft.io
 *   pnpm app:codigo cliente@empresa.com  # otra cuenta
 *
 * El codigo vence a los minutos (vigencia de OTP de Supabase) y solo sirve una vez.
 */
import { createClient } from '@supabase/supabase-js'

const email = process.argv[2] ?? 'demo-app@imsoft.io'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env')
  process.exit(1)
}
const db = createClient(url, key, { auth: { persistSession: false } })
const { data, error } = await db.auth.admin.generateLink({ type: 'magiclink', email })
const codigo = data?.properties?.email_otp
if (error || !codigo) {
  console.error(error?.message ?? 'Supabase no devolvió el código')
  process.exit(1)
}
console.log(codigo)
