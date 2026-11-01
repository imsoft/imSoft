/**
 * Prints a one-time code to sign in to the mobile app with an account, bypassing the
 * email and the /api/app/login rate limit. Handy for taking screenshots:
 *
 *   pnpm app:code                      # demo-app@imsoft.io account
 *   pnpm app:code cliente@empresa.com  # another account
 *
 * The code expires within minutes (Supabase OTP lifetime) and works only once.
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
const code = data?.properties?.email_otp
if (error || !code) {
  console.error(error?.message ?? 'Supabase no devolvió el código')
  process.exit(1)
}
console.log(code)
