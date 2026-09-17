import { ImageResponse } from 'next/og'
import { OG_SIZE, acortar, tarjetaDocumento } from '@/lib/og-documento'

export const runtime = 'edge'
export const size = OG_SIZE
export const contentType = 'image/png'

/** Tarjeta del contrato al compartir el enlace: folio, proyecto y cliente. Sin importes. */
export default async function Image({ params }: { params: Promise<{ lang: string; token: string }> }) {
  const { token } = await params
  let d = { tipo: 'Contrato' as const, folio: '', titulo: 'Contrato de prestación de servicios', cliente: '', pie: 'imSoft · Software a la medida · Guadalajara' }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/contracts?token=eq.${encodeURIComponent(token)}&select=folio,status,quotes(title,client_name,client_company)&limit=1`, {
      headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}` },
      cache: 'no-store',
    })
    const row = (await res.json())?.[0]
    if (row) {
      const q = row.quotes ?? {}
      d = { tipo: 'Contrato', folio: row.folio, titulo: acortar(q.title || d.titulo, 90), cliente: acortar(q.client_company || q.client_name || '', 60), pie: row.status === 'signed' ? 'Firmado en línea' : 'Revisa y firma en línea' }
    }
  } catch {}
  return new ImageResponse(tarjetaDocumento(d), size)
}
