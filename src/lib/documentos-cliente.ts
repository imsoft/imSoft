import type { SupabaseClient, User } from '@supabase/supabase-js'
import { contratosParaApp, type ContratoApp, type FilaContrato } from '@/lib/app-contratos'
import { cotizacionesParaApp, type CotizacionApp } from '@/lib/app-cotizaciones'

/**
 * Cotizaciones y contratos de un cliente, para la app y para su panel web. Las tablas son
 * solo de admin en la base, asi que se leen con service role y se filtran por el correo del
 * cliente o por las empresas que le pertenecen.
 */
type Db = SupabaseClient
type Cliente = Pick<User, 'id' | 'email'>

async function condicionesDe(db: Db, user: Cliente): Promise<string | null> {
  const { data: empresas } = await db.from('companies').select('id').eq('user_id', user.id)
  const idsEmpresa = (empresas ?? []).map((e) => e.id as string)
  const condiciones = [user.email ? `client_email.ilike.${user.email.replace(/[,()]/g, '')}` : null, idsEmpresa.length ? `company_id.in.(${idsEmpresa.join(',')})` : null].filter(Boolean)
  return condiciones.length ? condiciones.join(',') : null
}

export async function cotizacionesDelCliente(db: Db, user: Cliente, sitio: string): Promise<CotizacionApp[]> {
  const o = await condicionesDe(db, user)
  if (!o) return []
  const { data, error } = await db
    .from('quotes')
    .select('id, folio, title, status, items, apply_iva, discount, currency, valid_until, token, lang')
    .or(o)
    .order('created_at', { ascending: false })
  if (error) throw error
  return cotizacionesParaApp(data ?? [], sitio)
}

export async function contratosDelCliente(db: Db, user: Cliente, sitio: string): Promise<ContratoApp[]> {
  const o = await condicionesDe(db, user)
  if (!o) return []
  const { data: cotizaciones } = await db.from('quotes').select('id').or(o)
  const ids = (cotizaciones ?? []).map((q) => q.id as string)
  if (!ids.length) return []
  const { data, error } = await db
    .from('contracts')
    .select('id, folio, status, token, lang, signed_at, signed_name, quotes(title, folio)')
    .in('quote_id', ids)
    .order('created_at', { ascending: false })
  if (error) throw error
  return contratosParaApp((data ?? []) as unknown as FilaContrato[], sitio)
}
