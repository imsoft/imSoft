import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verificar que sea admin
    if (user.user_metadata?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Obtener la cotización con información del servicio
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select(`
        *,
        services (
          id,
          title_es,
          title_en,
          description_es,
          description_en
        )
      `)
      .eq('id', id)
      .single()

    if (quotationError || !quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      )
    }

    // Obtener las preguntas del cuestionario
    const { data: questions } = await supabase
      .from('quotation_questions')
      .select('*')
      .eq('service_id', quotation.service_id)
      .order('order_index')

    // Construir el prompt para ChatGPT
    const service = quotation.services as any
    const serviceName = service?.title_es || service?.title_en || 'Servicio'
    const serviceDescription = service?.description_es || service?.description_en || ''

    // Formatear respuestas del cuestionario
    const answersText = questions && quotation.answers
      ? Object.entries(quotation.answers)
          .map(([questionId, answer]) => {
            const question = questions.find(q => q.id === questionId)
            if (!question) return null
            
            const questionText = question.question_es || question.question_en
            let answerText = ''
            
            if (question.question_type === 'multiple_choice' && question.options) {
              const selectedOption = question.options.find((opt: any) =>
                opt.label_es === answer || opt.label_en === answer
              )
              answerText = selectedOption
                ? (selectedOption.label_es || selectedOption.label_en)
                : String(answer)
            } else if (question.question_type === 'yes_no') {
              answerText = answer === 'yes' || answer === 'si' ? 'Sí' : 'No'
            } else {
              answerText = String(answer)
            }
            
            return `- ${questionText}: ${answerText}`
          })
          .filter(Boolean)
          .join('\n')
      : 'No hay respuestas disponibles'

    const prompt = `Eres un experto en estimación de proyectos de desarrollo de software. Analiza la siguiente cotización y proporciona recomendaciones profesionales.

INFORMACIÓN DEL PROYECTO:
- Servicio: ${serviceName}
${serviceDescription ? `- Descripción del servicio: ${serviceDescription}` : ''}
- Cliente: ${quotation.client_name || 'No especificado'}
${quotation.client_company ? `- Empresa: ${quotation.client_company}` : ''}

RESPUESTAS DEL CUESTIONARIO:
${answersText}

INFORMACIÓN DE PRECIO ACTUAL:
- Subtotal: $${quotation.subtotal.toFixed(2)} MXN
- IVA (16%): $${quotation.iva.toFixed(2)} MXN
- Total: $${quotation.total.toFixed(2)} MXN

INSTRUCCIONES:
1. Analiza la complejidad del proyecto basándote en las respuestas del cuestionario
2. Estima el tiempo de desarrollo en días hábiles (considera 8 horas por día)
3. Recomienda un precio final razonable considerando:
   - Complejidad técnica
   - Tiempo estimado
   - Costos de desarrollo
   - Margen de ganancia razonable (20-30%)
   - Mercado mexicano

Responde ÚNICAMENTE en formato JSON válido con esta estructura exacta:
{
  "recommended_price": número (precio final recomendado en MXN),
  "recommended_time_days": número (días hábiles estimados),
  "reasoning": "explicación breve de 2-3 oraciones sobre el precio recomendado",
  "analysis": "análisis detallado de 4-6 oraciones sobre la complejidad, alcance y consideraciones del proyecto"
}

IMPORTANTE: Solo responde con el JSON, sin texto adicional antes o después.`

    // Verificar que la API key esté configurada
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    // Inicializar OpenAI solo cuando se necesite
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Llamar a ChatGPT
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en estimación de proyectos de desarrollo de software. Proporcionas análisis profesionales y recomendaciones precisas basadas en información técnica.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const recommendationText = completion.choices[0]?.message?.content
    if (!recommendationText) {
      throw new Error('No se recibió respuesta de OpenAI')
    }

    let recommendation
    try {
      recommendation = JSON.parse(recommendationText)
    } catch (parseError) {
      // Si falla el parseo, intentar extraer JSON del texto
      const jsonMatch = recommendationText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        recommendation = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No se pudo parsear la respuesta de OpenAI')
      }
    }

    // Guardar la recomendación en la base de datos
    const { error: updateError } = await supabase
      .from('quotations')
      .update({ ai_recommendation: recommendation })
      .eq('id', id)

    if (updateError) {
      console.error('Error saving recommendation:', updateError)
      // No fallar si solo falla el guardado, devolver la recomendación de todas formas
    }

    return NextResponse.json({ 
      success: true, 
      recommendation 
    })
  } catch (error) {
    console.error('Error in AI recommendation route:', error)
    return NextResponse.json(
      { 
        error: 'Error generating AI recommendation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
