import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, clientIp, sendEmail, serviceClient } from '@/lib/quotes/server'
import { contractSignedEmail } from '@/lib/email/templates'
import { signatureError } from '@/lib/contract-signature'
import { contractHash } from '@/lib/contract-hash'

/**
 * The client signs the contract from the public link: name, checkbox and drawn signature.
 * Besides the quote evidence (date, IP, browser) the SHA-256 hash of the accepted text
 * is stored.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const body = await req.json().catch(() => ({}))
  const name = String(body.name ?? '').trim()
  if (name.length < 3) return NextResponse.json({ error: 'Escribe tu nombre completo para aceptar.' }, { status: 400 })
  if (!body.accepted) return NextResponse.json({ error: 'Marca la casilla de aceptación.' }, { status: 400 })
  const reason = signatureError(body.signature)
  if (reason) return NextResponse.json({ error: reason }, { status: 400 })

  const db = serviceClient()
  const { data: c } = await db.from('contracts').select('*, quotes(id, number, title, client_name)').eq('token', token).maybeSingle()
  if (!c) return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })
  if (c.status === 'signed') return NextResponse.json({ error: 'Este contrato ya fue aceptado.' }, { status: 409 })
  if (c.status !== 'sent') return NextResponse.json({ error: 'Este contrato todavía no se ha enviado.' }, { status: 409 })

  const now = new Date().toISOString()
  const { error } = await db
    .from('contracts')
    .update({
      status: 'signed',
      signed_at: now,
      signed_name: name,
      signed_ip: clientIp(req.headers),
      signed_user_agent: req.headers.get('user-agent') ?? null,
      signed_signature: body.signature as string,
      signed_hash: contractHash(c.body_html),
      updated_at: now,
    })
    .eq('id', c.id)
    .eq('status', 'sent')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    const q = c.quotes as { id: string; number: string; title: string } | null
    await sendEmail({ to: ADMIN_EMAIL, ...contractSignedEmail({ name, number: c.number, title: q?.title, quoteNumber: q?.number, quoteId: q?.id, date: new Date(now) }) })
  } catch (e) {
    console.error('[contracts] signed notice not sent:', e)
  }
  return NextResponse.json({ ok: true })
}
