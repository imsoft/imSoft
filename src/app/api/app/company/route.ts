import { NextRequest, NextResponse } from 'next/server'
import { companyForApp, validateCompanyName } from '@/lib/mobile-app/company'
import { bodyField, legacyCompany } from '@/lib/mobile-app/legacy'
import { INVALID_SESSION, userFromBearer } from '@/lib/mobile-app/session'
import { serviceClient } from '@/lib/quotes/server'

const COLUMNS = 'id, name, logo_url'

const respond = (row: { id: string; name: string | null; logo_url: string | null } | null) => {
  const company = row ? companyForApp(row) : null
  return NextResponse.json({ company, empresa: legacyCompany(company) })
}

/** Mobile app: the client's company (their first one), and renaming or creating it. */
export async function GET(req: NextRequest) {
  const user = await userFromBearer(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: INVALID_SESSION }, { status: 401 })
  const { data } = await serviceClient().from('companies').select(COLUMNS).eq('user_id', user.id).order('created_at', { ascending: true }).limit(1).maybeSingle()
  return respond(data)
}

export async function PUT(req: NextRequest) {
  const user = await userFromBearer(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: INVALID_SESSION }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const raw = bodyField(body, 'name', 'nombre')
  const invalid = validateCompanyName(raw)
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 })
  const name = String(raw).trim()
  const db = serviceClient()
  const { data: current } = await db.from('companies').select('id').eq('user_id', user.id).order('created_at', { ascending: true }).limit(1).maybeSingle()
  const r = current
    ? await db.from('companies').update({ name, updated_at: new Date().toISOString() }).eq('id', current.id).eq('user_id', user.id).select(COLUMNS).single()
    : await db.from('companies').insert({ name, user_id: user.id }).select(COLUMNS).single()
  if (r.error || !r.data) return NextResponse.json({ error: 'No se pudo guardar la empresa. Intenta de nuevo.' }, { status: 500 })
  return respond(r.data)
}
