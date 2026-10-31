import { NextRequest, NextResponse } from 'next/server'
import { clientQuotes } from '@/lib/mobile-app/client-documents'
import { legacyQuote } from '@/lib/mobile-app/legacy'
import { INVALID_SESSION, userFromBearer } from '@/lib/mobile-app/session'
import { serviceClient, SITE_URL } from '@/lib/quotes/server'

/** Mobile app: the client's quotes (the shared query lives in client-documents). */
export async function GET(req: NextRequest) {
  const user = await userFromBearer(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: INVALID_SESSION }, { status: 401 })
  try {
    const quotes = await clientQuotes(serviceClient(), user, SITE_URL)
    return NextResponse.json({ quotes, cotizaciones: quotes.map(legacyQuote) })
  } catch (e) {
    console.error('[app/quotes]', e)
    return NextResponse.json({ error: 'No pudimos leer tus cotizaciones. Intenta de nuevo.' }, { status: 500 })
  }
}
