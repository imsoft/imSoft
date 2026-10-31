import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { requireAdmin } from '@/lib/quotes/server'
import { createClient } from '@/lib/supabase/server'
import { ASSIST_TOOL, buildPrompt, comparablesFromQuotes, normalizeOutput, validateInput, type Comparable } from '@/lib/quote-assist'

export const maxDuration = 60

/** Latest sent quotes, as a price reference. If it fails, it carries on without them. */
async function loadComparables(excludeId: string | null | undefined): Promise<Comparable[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quotes')
    .select('id, number, status, title, items, features, discount, created_at')
    .neq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(60)
  if (error) {
    console.error('[quotes/assist] comparables', error)
    return []
  }
  return comparablesFromQuotes(data ?? [], excludeId)
}

/** Price, feature, retainer, question and risk recommendations for a quote. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Falta ANTHROPIC_API_KEY en el entorno del servidor (Vercel → Settings → Environment Variables).' }, { status: 500 })
  }
  const v = validateInput(await req.json().catch(() => ({})))
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  const comparables = await loadComparables(v.input.quoteId)
  const input = { ...v.input, comparables }

  const client = new Anthropic()
  try {
    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 4000,
      tools: [ASSIST_TOOL],
      tool_choice: { type: 'tool', name: ASSIST_TOOL.name },
      messages: [{ role: 'user', content: buildPrompt(input) }],
    })
    if (response.stop_reason === 'refusal') {
      return NextResponse.json({ error: 'El modelo no pudo responder a esta solicitud.' }, { status: 502 })
    }
    const tool = response.content.find((b) => b.type === 'tool_use')
    if (!tool || tool.type !== 'tool_use') {
      return NextResponse.json({ error: 'El modelo no devolvió recomendaciones.' }, { status: 502 })
    }
    return NextResponse.json(normalizeOutput(tool.input, input.features, comparables.map((c) => c.number)))
  } catch (err) {
    console.error('[quotes/assist]', err)
    const msg = err instanceof Anthropic.APIError ? `Anthropic ${err.status}: ${err.message}` : 'No se pudieron obtener las recomendaciones.'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
