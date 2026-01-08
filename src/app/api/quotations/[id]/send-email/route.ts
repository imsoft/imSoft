import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Obtener la cotización con información del servicio
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

    // Verificar que el usuario tenga acceso (admin o dueño de la cotización)
    if (user.user_metadata?.role !== 'admin' && quotation.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    if (!quotation.client_email) {
      return NextResponse.json(
        { error: 'Client email is required' },
        { status: 400 }
      )
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

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
      }).format(amount)
    }

    // Generar HTML del email
    const answersHTML = quotation.answers && Object.keys(quotation.answers).length > 0
      ? Object.entries(quotation.answers).map(([questionId, answer]) => {
          const question = questions?.find(q => q.id === questionId)
          const questionText = question
            ? question.question_es
            : `Pregunta ID: ${questionId}`
          
          let answerText = ''
          if (question) {
            if (question.question_type === 'multiple_choice' && question.options) {
              const selectedOption = question.options.find((opt: any) =>
                opt.label_es === answer || opt.label_en === answer
              )
              answerText = selectedOption ? selectedOption.label_es : String(answer)
            } else if (question.question_type === 'yes_no') {
              answerText = answer === 'yes' || answer === 'si' ? 'Sí' : 'No'
            } else {
              answerText = String(answer)
            }
          } else {
            answerText = typeof answer === 'object' ? JSON.stringify(answer) : String(answer)
          }

          return `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                <strong>${questionText}</strong><br>
                <span style="color: #6b7280;">${answerText}</span>
              </td>
            </tr>
          `
        }).join('')
      : '<tr><td style="padding: 12px; color: #6b7280;">No se proporcionaron respuestas</td></tr>'

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">imSoft</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Cotización</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
              <h2 style="color: #667eea; margin-top: 0; font-size: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Información General</h2>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555; width: 150px;">Cliente:</td>
                  <td style="padding: 8px 0;">${quotation.client_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
                  <td style="padding: 8px 0;">${quotation.client_email}</td>
                </tr>
                ${quotation.client_phone ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Teléfono:</td>
                  <td style="padding: 8px 0;">${quotation.client_phone}</td>
                </tr>
                ` : ''}
                ${quotation.client_company ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Empresa:</td>
                  <td style="padding: 8px 0;">${quotation.client_company}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Servicio:</td>
                  <td style="padding: 8px 0;">${serviceName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Fecha:</td>
                  <td style="padding: 8px 0;">${new Date(quotation.created_at).toLocaleDateString('es-MX')}</td>
                </tr>
              </table>
            </div>

            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
              <h2 style="color: #667eea; margin-top: 0; font-size: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Respuestas del Cuestionario</h2>
              <table style="width: 100%;">
                ${answersHTML}
              </table>
            </div>

            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #667eea; margin-top: 0; font-size: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Resumen del Precio</h2>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; color: #555;">Subtotal:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${formatCurrency(quotation.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #555;">IVA (16%):</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${formatCurrency(quotation.iva)}</td>
                </tr>
                <tr style="border-top: 2px solid #667eea;">
                  <td style="padding: 12px 0; font-size: 18px; font-weight: bold; color: #667eea;">Total:</td>
                  <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold; color: #667eea;">${formatCurrency(quotation.total)}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
              <p>Este es un correo automático de imSoft. Por favor, no responda a este correo.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Enviar email
    const { data, error } = await resend.emails.send({
      from: 'imSoft <noreply@imsoft.io>',
      to: quotation.client_email,
      subject: `Cotización: ${quotation.title || serviceName}`,
      html: html,
    })

    if (error) {
      console.error('Error sending email:', error)
      return NextResponse.json(
        { error: 'Error sending email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in send email route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
