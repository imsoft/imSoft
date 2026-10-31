import type { SupabaseClient, User } from '@supabase/supabase-js'
import { contractsForApp, type AppContract, type ContractRow } from './contracts'
import { quotesForApp, type AppQuote } from './quotes'

/**
 * A client's quotes and contracts, for the app and for their web panel. The tables are
 * admin-only in the database, so they're read with the service role and filtered by the
 * client's email or by the companies they own.
 */
type Client = Pick<User, 'id' | 'email'>

async function ownershipFilter(db: SupabaseClient, user: Client): Promise<string | null> {
  const { data: companies } = await db.from('companies').select('id').eq('user_id', user.id)
  const companyIds = (companies ?? []).map((c) => c.id as string)
  const conditions = [
    user.email ? `client_email.ilike.${user.email.replace(/[,()]/g, '')}` : null,
    companyIds.length ? `company_id.in.(${companyIds.join(',')})` : null,
  ].filter(Boolean)
  return conditions.length ? conditions.join(',') : null
}

export async function clientQuotes(db: SupabaseClient, user: Client, site: string): Promise<AppQuote[]> {
  const filter = await ownershipFilter(db, user)
  if (!filter) return []
  const { data, error } = await db
    .from('quotes')
    .select('id, number, title, status, items, apply_iva, discount, currency, valid_until, token, lang, payment, accepted_payment_option')
    .or(filter)
    .order('created_at', { ascending: false })
  if (error) throw error
  return quotesForApp(data ?? [], site)
}

export async function clientContracts(db: SupabaseClient, user: Client, site: string): Promise<AppContract[]> {
  const filter = await ownershipFilter(db, user)
  if (!filter) return []
  const { data: quotes } = await db.from('quotes').select('id').or(filter)
  const ids = (quotes ?? []).map((q) => q.id as string)
  if (!ids.length) return []
  const { data, error } = await db
    .from('contracts')
    .select('id, number, status, token, lang, signed_at, signed_name, quotes(title, number)')
    .in('quote_id', ids)
    .order('created_at', { ascending: false })
  if (error) throw error
  return contractsForApp((data ?? []) as unknown as ContractRow[], site)
}
