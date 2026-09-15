import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { requireAdmin } from '@/lib/quotes/server'
import { ASSIST_TOOL, buildPrompt, normalizarOutput, validarInput } from '@/lib/quote-assist'

export const maxDuration = 60

/** Recomendaciones de precio, caracteristicas, preguntas y riesgos para una cotizacion. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Falta ANTHROPIC_API_KEY en el entorno del servidor (Vercel → Settings → Environment Variables).' }, { status: 500 })
  }
  const v = validarInput(await req.json().catch(() => ({})))
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  const client = new Anthropic()
  try {
    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 4000,
      tools: [ASSIST_TOOL],
      tool_choice: { type: 'tool', name: ASSIST_TOOL.name },
      messages: [{ role: 'user', content: buildPrompt(v.input) }],
    })
    if (response.stop_reason === 'refusal') {
      return NextResponse.json({ error: 'El modelo no pudo responder a esta solicitud.' }, { status: 502 })
    }
    const tool = response.content.find((b) => b.type === 'tool_use')
    if (!tool || tool.type !== 'tool_use') {
      return NextResponse.json({ error: 'El modelo no devolvió recomendaciones.' }, { status: 502 })
    }
    return NextResponse.json(normalizarOutput(tool.input, v.input.features))
  } catch (err) {
    console.error('[quotes/assist]', err)
    const msg = err instanceof Anthropic.APIError ? `Anthropic ${err.status}: ${err.message}` : 'No se pudieron obtener las recomendaciones.'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
