import { ImageResponse } from 'next/og'
import { OG_SIZE, acortar, tarjetaDocumento } from '@/lib/og-documento'

export const runtime = 'edge'
export const size = OG_SIZE
export const contentType = 'image/png'

/** Tarjeta de la cotizacion al compartir el enlace: folio, proyecto, cliente y vigencia. Sin importes. */
export default async function Image({ params }: { params: Promise<{ lang: string; token: string }> }) {
  const { token } = await params
  let d = { tipo: 'Cotización' as const, folio: '', titulo: 'Cotización de imSoft', cliente: '', pie: 'Software a la medida · Guadalajara' }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/quotes?token=eq.${encodeURIComponent(token)}&select=folio,title,client_name,client_company,valid_until&limit=1`, {
      headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}` },
      cache: 'no-store',
    })
    const row = (await res.json())?.[0]
    if (row) {
      const vence = new Date(`${row.valid_until}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
      d = { tipo: 'Cotización', folio: row.folio, titulo: acortar(row.title, 90), cliente: acortar(row.client_company || row.client_name, 60), pie: `Vigente hasta el ${vence} · acepta en línea` }
    }
  } catch {}
  return new ImageResponse(tarjetaDocumento(d), size)
}
