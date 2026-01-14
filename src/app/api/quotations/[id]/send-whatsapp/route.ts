import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import twilio from 'twilio'

// Inicializar cliente de Twilio solo cuando se necesite
function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials are not configured')
  }

  return twilio(accountSid, authToken)
}

// Función para formatear número de teléfono a formato internacional
function formatPhoneNumber(phone: string): string {
  // Remover todos los caracteres no numéricos
  let cleaned = phone.replace(/\D/g, '')
  
  // Si no empieza con código de país, asumir México (52)
  if (!cleaned.startsWith('52') && cleaned.length === 10) {
    cleaned = '52' + cleaned
  }
  
  // Si no empieza con código de país, agregar 52
  if (!cleaned.startsWith('52') && cleaned.length > 10) {
    // Ya tiene código de país diferente, usar tal cual
  } else if (!cleaned.startsWith('52')) {
    cleaned = '52' + cleaned
  }
  
  return `whatsapp:+${cleaned}`
}

// Función para generar el mensaje de WhatsApp
function generateWhatsAppMessage(quotation: any, questions: any[], serviceName: string, lang: 'es' | 'en'): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const isSpanish = lang === 'es'
  
  // Precio a mostrar (precio final si existe, sino el total calculado)
  const displayPrice = quotation.final_price || quotation.total
  
  // Tiempo estimado si existe
  const timeInfo = quotation.estimated_development_time
    ? `\n⏱️ ${isSpanish ? 'Tiempo estimado' : 'Estimated time'}: ${quotation.estimated_development_time} ${isSpanish ? 'días' : 'days'}`
    : ''

  // Resumen de respuestas (máximo 3-4 más importantes)
  let answersSummary = ''
  if (quotation.answers && questions && Object.keys(quotation.answers).length > 0) {
    const answerEntries = Object.entries(quotation.answers).slice(0, 3)
    const summaryLines = answerEntries.map(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId)
      if (!question) return null
      
      const questionText = isSpanish ? question.question_es : question.question_en
      let answerText = ''
      
      if (question.question_type === 'multiple_choice' && question.options) {
        const selectedOption = question.options.find((opt: any) =>
          opt.label_es === answer || opt.label_en === answer
        )
        answerText = selectedOption
          ? (isSpanish ? selectedOption.label_es : selectedOption.label_en)
          : String(answer)
      } else if (question.question_type === 'yes_no') {
        answerText = answer === 'yes' || answer === 'si'
          ? (isSpanish ? 'Sí' : 'Yes')
          : (isSpanish ? 'No' : 'No')
      } else {
        answerText = String(answer)
      }
      
      return `• ${questionText}: ${answerText}`
    }).filter(Boolean)
    
    if (summaryLines.length > 0) {
      answersSummary = `\n\n${isSpanish ? '📋 Resumen:' : '📋 Summary:'}\n${summaryLines.join('\n')}`
      if (Object.keys(quotation.answers).length > 3) {
        answersSummary += `\n${isSpanish ? '... y más' : '... and more'}`
      }
    }
  }

  const message = `🏢 *imSoft - ${isSpanish ? 'Cotización' : 'Quotation'}*

${isSpanish ? 'Hola' : 'Hello'} *${quotation.client_name || 'Cliente'}*,

${isSpanish ? 'Te enviamos la cotización solicitada:' : 'We are sending you the requested quotation:'}

📋 *${isSpanish ? 'Servicio' : 'Service'}:* ${serviceName}
💰 *${isSpanish ? 'Precio Total' : 'Total Price'}:* ${formatCurrency(displayPrice)}${timeInfo}${answersSummary}

${quotation.valid_until ? `📅 ${isSpanish ? 'Válida hasta' : 'Valid until'}: ${new Date(quotation.valid_until).toLocaleDateString(isSpanish ? 'es-MX' : 'en-US')}\n` : ''}
${isSpanish ? 'Para más detalles, contáctanos.' : 'For more details, contact us.'}

${isSpanish ? 'Gracias por confiar en imSoft.' : 'Thank you for trusting imSoft.'}`

  return message
}

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

    // Verificar que el usuario tenga acceso (admin o dueño de la cotización)
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select(`
        *,
        services (
          id,
          title_es,
          title_en
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

    if (user.user_metadata?.role !== 'admin' && quotation.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Validar que exista el número de teléfono
    if (!quotation.client_phone) {
      return NextResponse.json(
        { error: 'Client phone number is required' },
        { status: 400 }
      )
    }

    // Validar configuración de Twilio
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_NUMBER) {
      return NextResponse.json(
        { 
          error: 'WhatsApp service is not configured',
          details: 'Please configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER in your environment variables'
        },
        { status: 500 }
      )
    }

    // Validar y formatear el número de WhatsApp de Twilio
    let twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER.trim()
    
    // Si el número no tiene el prefijo 'whatsapp:', agregarlo
    if (!twilioWhatsAppNumber.startsWith('whatsapp:')) {
      // Si tiene el prefijo +, mantenerlo, sino agregarlo
      if (!twilioWhatsAppNumber.startsWith('+')) {
        twilioWhatsAppNumber = '+' + twilioWhatsAppNumber
      }
      twilioWhatsAppNumber = `whatsapp:${twilioWhatsAppNumber}`
    }

    // Obtener las preguntas del cuestionario
    const { data: questions } = await supabase
      .from('quotation_questions')
      .select('*')
      .eq('service_id', quotation.service_id)
      .order('order_index')

    const service = quotation.services as any
    const serviceName = quotation.client_company 
      ? `${quotation.client_company} - ${service?.title_es || service?.title_en || ''}`
      : service?.title_es || service?.title_en || ''

    // Determinar idioma (podría venir de la cotización o usar español por defecto)
    const lang = 'es' // Por defecto español, podría mejorarse detectando del usuario

    // Generar mensaje
    const messageBody = generateWhatsAppMessage(quotation, questions || [], serviceName, lang)

    // Formatear número de teléfono
    let formattedPhone: string
    try {
      formattedPhone = formatPhoneNumber(quotation.client_phone)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Enviar mensaje por WhatsApp usando Twilio
    const client = getTwilioClient()
    const message = await client.messages.create({
      from: twilioWhatsAppNumber,
      to: formattedPhone,
      body: messageBody,
    })

    return NextResponse.json({ 
      success: true, 
      messageSid: message.sid,
      data: {
        to: formattedPhone,
        status: message.status
      }
    })
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    
    // Manejar errores específicos de Twilio
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      
      // Error de canal no encontrado (número de WhatsApp no configurado)
      if (errorMessage.includes('could not find a channel') || 
          errorMessage.includes('channel with the specified from address')) {
        return NextResponse.json(
          { 
            error: 'WhatsApp number not configured in Twilio',
            details: 'The WhatsApp number specified in TWILIO_WHATSAPP_NUMBER is not active or verified in your Twilio account. Please verify the number in Twilio Console → Messaging → Try it out → Send a WhatsApp message. Your configured number: +523325365558'
          },
          { status: 500 }
        )
      }
      
      // Error de número no válido
      if (errorMessage.includes('not a valid whatsapp number')) {
        return NextResponse.json(
          { 
            error: 'The phone number is not registered on WhatsApp',
            details: 'The recipient phone number must be registered on WhatsApp'
          },
          { status: 400 }
        )
      }
      
      // Error de credenciales
      if (errorMessage.includes('credentials') || errorMessage.includes('authentication')) {
        return NextResponse.json(
          { 
            error: 'Twilio authentication error',
            details: 'Please verify your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are correct'
          },
          { status: 500 }
        )
      }
      
      // Error de cuenta sin créditos
      if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
        return NextResponse.json(
          { 
            error: 'Insufficient Twilio account balance',
            details: 'Your Twilio account does not have sufficient credits to send WhatsApp messages'
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { 
        error: 'Error sending WhatsApp message',
        details: error instanceof Error ? error.message : 'Unknown error',
        // Solo incluir detalles completos en desarrollo
        ...(process.env.NODE_ENV === 'development' && { fullError: error })
      },
      { status: 500 }
    )
  }
}
