import { NextRequest, NextResponse } from 'next/server'
import { clientContracts } from '@/lib/mobile-app/client-documents'
import { legacyContract } from '@/lib/mobile-app/legacy'
import { INVALID_SESSION, userFromBearer } from '@/lib/mobile-app/session'
import { serviceClient, SITE_URL } from '@/lib/quotes/server'

/** Mobile app: the client's contracts (sent and signed), with their public url. */
export async function GET(req: NextRequest) {
  const user = await userFromBearer(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: INVALID_SESSION }, { status: 401 })
  try {
    const contracts = await clientContracts(serviceClient(), user, SITE_URL)
    return NextResponse.json({ contracts, contratos: contracts.map(legacyContract) })
  } catch (e) {
    console.error('[app/contracts]', e)
    return NextResponse.json({ error: 'No pudimos leer tus contratos. Intenta de nuevo.' }, { status: 500 })
  }
}
