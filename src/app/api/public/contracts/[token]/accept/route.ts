import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, SITE_URL, clientIp, enviarCorreo, esc, serviceClient } from '@/lib/quotes/server'

/** El cliente acepta el contrato desde el enlace publico. Misma evidencia que la cotizacion. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const body = await req.json().catch(() => ({}))
  const nombre = String(body.nombre ?? '').trim()
  if (nombre.length < 3) return NextResponse.json({ error: 'Escribe tu nombre completo para aceptar.' }, { status: 400 })
  if (!body.acepta) return NextResponse.json({ error: 'Marca la casilla de aceptación.' }, { status: 400 })

  const db = serviceClient()
  const { data: c } = await db.from('contracts').select('*, quotes(id, folio, title, client_name)').eq('token', token).maybeSingle()
  if (!c) return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })
  if (c.status === 'signed') return NextResponse.json({ error: 'Este contrato ya fue aceptado.' }, { status: 409 })
  if (c.status !== 'sent') return NextResponse.json({ error: 'Este contrato todavía no se ha enviado.' }, { status: 409 })

  const ahora = new Date().toISOString()
  const { error } = await db
    .from('contracts')
    .update({ status: 'signed', signed_at: ahora, signed_name: nombre, signed_ip: clientIp(req.headers), signed_user_agent: req.headers.get('user-agent') ?? null, updated_at: ahora })
    .eq('id', c.id)
    .eq('status', 'sent')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    const q = c.quotes as { id: string; folio: string; title: string } | null
    await enviarCorreo({
      to: ADMIN_EMAIL,
      subject: `✓ Contrato aceptado: ${c.folio}${q ? ` · ${q.title}` : ''}`,
      html: `<p><strong>${esc(nombre)}</strong> aceptó el contrato <strong>${esc(c.folio)}</strong>.</p>${q ? `<p><a href="${SITE_URL}/es/dashboard/admin/cotizaciones/${q.id}">Abrir en el panel</a>.</p>` : ''}`,
    })
  } catch (e) {
    console.error('[contracts] aviso no enviado:', e)
  }
  return NextResponse.json({ ok: true })
}
