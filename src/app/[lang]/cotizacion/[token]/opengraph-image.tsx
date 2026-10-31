import { ImageResponse } from 'next/og'
import { OG_SIZE, truncate, documentCard } from '@/lib/og-document'

export const runtime = 'edge'
export const size = OG_SIZE
export const contentType = 'image/png'

/** Quote card when the link is shared: number, project, client and validity. No amounts. */
export default async function Image({ params }: { params: Promise<{ lang: string; token: string }> }) {
  const { token } = await params
  let d = { kind: 'Cotización' as const, number: '', title: 'Cotización de imSoft', client: '', footer: 'Software a la medida · Guadalajara' }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/quotes?token=eq.${encodeURIComponent(token)}&select=number,title,client_name,client_company,valid_until&limit=1`, {
      headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}` },
      cache: 'no-store',
    })
    const row = (await res.json())?.[0]
    if (row) {
      const expires = new Date(`${row.valid_until}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
      d = { kind: 'Cotización', number: row.number, title: truncate(row.title, 90), client: truncate(row.client_company || row.client_name, 60), footer: `Vigente hasta el ${expires} · acepta en línea` }
    }
  } catch {}
  return new ImageResponse(documentCard(d), size)
}
