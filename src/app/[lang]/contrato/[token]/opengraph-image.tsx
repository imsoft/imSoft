import { ImageResponse } from 'next/og'
import { OG_SIZE, truncate, documentCard } from '@/lib/og-document'

export const runtime = 'edge'
export const size = OG_SIZE
export const contentType = 'image/png'

/** Contract card when the link is shared: number, project and client. No amounts. */
export default async function Image({ params }: { params: Promise<{ lang: string; token: string }> }) {
  const { token } = await params
  let d = { kind: 'Contrato' as const, number: '', title: 'Contrato de prestación de servicios', client: '', footer: 'imSoft · Software a la medida · Guadalajara' }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/contracts?token=eq.${encodeURIComponent(token)}&select=number,status,quotes(title,client_name,client_company)&limit=1`, {
      headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}` },
      cache: 'no-store',
    })
    const row = (await res.json())?.[0]
    if (row) {
      const q = row.quotes ?? {}
      d = { kind: 'Contrato', number: row.number, title: truncate(q.title || d.title, 90), client: truncate(q.client_company || q.client_name || '', 60), footer: row.status === 'signed' ? 'Firmado en línea' : 'Revisa y firma en línea' }
    }
  } catch {}
  return new ImageResponse(documentCard(d), size)
}
