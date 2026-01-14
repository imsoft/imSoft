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

    // Color primario de marca: #1e9df1
    const primaryColor = '#1e9df1'
    const primaryColorDark = '#1788d9' // Versión más oscura para gradientes

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
          <div style="background: ${primaryColor}; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">imSoft</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Cotización</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
              <h2 style="color: ${primaryColor}; margin-top: 0; font-size: 20px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 10px;">Información General</h2>
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

            ${quotation.description ? `
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
              <h2 style="color: ${primaryColor}; margin-top: 0; font-size: 20px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 10px;">Descripción del Proyecto</h2>
              <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${quotation.description}</p>
            </div>
            ` : ''}

            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
              <h2 style="color: ${primaryColor}; margin-top: 0; font-size: 20px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 10px;">Respuestas del Cuestionario</h2>
              <table style="width: 100%;">
                ${answersHTML}
              </table>
            </div>

            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
              <h2 style="color: ${primaryColor}; margin-top: 0; font-size: 20px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 10px;">Resumen del Precio</h2>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; color: #555;">Subtotal:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${formatCurrency(quotation.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #555;">IVA (16%):</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${formatCurrency(quotation.iva)}</td>
                </tr>
                <tr style="border-top: 2px solid ${primaryColor};">
                  <td style="padding: 12px 0; font-size: 18px; font-weight: bold; color: ${primaryColor};">Total:</td>
                  <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold; color: ${primaryColor};">${formatCurrency(quotation.total)}</td>
                </tr>
              </table>
              <div style="margin-top: 15px; padding: 12px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                  <strong>⚠️ Importante:</strong> Este precio es una estimación inicial basada en las respuestas del cuestionario. El precio final puede verse afectado por los detalles específicos mencionados en la descripción del proyecto, así como por futuras adecuaciones durante la negociación. Te contactaremos para discutir los detalles y confirmar el precio final.
                </p>
              </div>
            </div>

            <!-- Llamadas a la Acción -->
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
              <h2 style="color: ${primaryColor}; margin-top: 0; font-size: 20px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 10px; text-align: center;">¿Tienes Preguntas o Quieres Continuar?</h2>
              <p style="text-align: center; color: #555; margin-bottom: 20px;">Estamos aquí para ayudarte. Elige la forma que prefieras para contactarnos:</p>
              
              <div style="display: flex; flex-direction: row; gap: 12px; justify-content: center; flex-wrap: wrap; max-width: 600px; margin: 0 auto;">
                <!-- Botón WhatsApp -->
                <a href="https://wa.me/523325365558?text=${encodeURIComponent(`Hola, soy ${quotation.client_name} y me interesa el proyecto: ${quotation.title || serviceName}. Me gustaría obtener más información.`)}" 
                   style="display: inline-block; background: #25D366; color: white; text-align: center; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; transition: background 0.3s; white-space: nowrap;">
                  💬 WhatsApp
                </a>
                
                <!-- Botón Email -->
                <a href="mailto:weareimsoft@gmail.com?subject=${encodeURIComponent(`Consulta sobre: ${quotation.title || serviceName}`)}&body=${encodeURIComponent(`Hola,\n\nSoy ${quotation.client_name}${quotation.client_company ? ` de ${quotation.client_company}` : ''} y me interesa el proyecto: ${quotation.title || serviceName}.\n\nMe gustaría obtener más información.\n\nSaludos,\n${quotation.client_name}`)}" 
                   style="display: inline-block; background: ${primaryColor}; color: white; text-align: center; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; transition: background 0.3s; white-space: nowrap;">
                  ✉️ Email
                </a>
                
                <!-- Botón Contacto -->
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io'}/es/contact" 
                   style="display: inline-block; background: #f8f9fa; color: ${primaryColor}; text-align: center; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; border: 2px solid ${primaryColor}; transition: background 0.3s; white-space: nowrap;">
                  📋 Contacto
                </a>
              </div>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
              <p style="margin: 0 0 8px 0;">Este es un correo automático de imSoft. Por favor, no responda a este correo.</p>
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">El precio mostrado es una estimación y puede variar según los detalles del proyecto y la negociación.</p>
            </div>

            <!-- Firma Electrónica -->
            <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0" border="0" style="font-family: Geist, Geist_Mono, -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Arial, sans-serif; color:#0b0b0b; width: 100%;">
                <tr>
                  <!-- LOGO -->
                  <td style="padding-right:16px; vertical-align:top;">
                    <img
                      src="https://res.cloudinary.com/https-imsoft-io/image/upload/v1740963749/imsoft-images/imsoft/logo-imsoft-blue.png"
                      alt="imSoft"
                      height="145"
                      style="display:block; border:0; outline:none; height:145px; width:auto;"
                    />
                  </td>

                  <!-- TEXTO -->
                  <td style="vertical-align:top;">
                    <div style="font-size:16px; font-weight:700; line-height:1.15; margin:0;">
                      Brandon Uriel Garcia Ramos
                    </div>

                    <div style="margin-top:4px; font-size:13px; color:#334155; line-height:1.35;">
                      imSoft
                      <span style="font-weight:700; color:#2563eb; font-size:6px; vertical-align:middle;">●</span>
                      Soluciones digitales a la medida
                    </div>

                    <div style="margin-top:10px; font-size:13px; line-height:1.6;">
                      <div>
                        <a href="mailto:contacto@imsoft.io" style="color:#2563eb; text-decoration:none;">
                          contacto@imsoft.io
                        </a>
                      </div>
                      <div>
                        <a href="tel:+523325365558" style="color:#2563eb; text-decoration:none;">
                          33 2536 5558
                        </a>
                      </div>
                      <div>
                        <a href="https://imsoft.io" style="color:#2563eb; text-decoration:none;">
                          imsoft.io
                        </a>
                      </div>
                    </div>

                    <!-- SERVICIOS (alfabético + icono) -->
                    <div style="margin-top:10px; font-size:12px; color:#475569; line-height:1.6;">
                      <span style="white-space:nowrap;">
                        <span style="font-weight:700; color:#2563eb; font-size:6px; vertical-align:middle;">●</span>&nbsp;Análisis de datos
                      </span>
                      
                      <span style="white-space:nowrap;">
                        <span style="font-weight:700; color:#2563eb; font-size:6px; vertical-align:middle;">●</span>&nbsp;Aplicaciones Móviles
                      </span>
                      
                      <span style="white-space:nowrap;">
                        <span style="font-weight:700; color:#2563eb; font-size:6px; vertical-align:middle;">●</span>&nbsp;Aplicaciones Web
                      </span>
                      
                      <span style="white-space:nowrap;">
                        <span style="font-weight:700; color:#2563eb; font-size:6px; vertical-align:middle;">●</span>&nbsp;Consultoría Tecnológica
                      </span>
                      
                      <span style="white-space:nowrap;">
                        <span style="font-weight:700; color:#2563eb; font-size:6px; vertical-align:middle;">●</span>&nbsp;Páginas Web
                      </span>
                      
                      <span style="white-space:nowrap;">
                        <span style="font-weight:700; color:#2563eb; font-size:6px; vertical-align:middle;">●</span>&nbsp;Tienda en línea
                      </span>

                      <span style="white-space:nowrap;">
                        <span style="font-weight:700; color:#2563eb; font-size:6px; vertical-align:middle;">●</span>
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </body>
      </html>
    `

    // Verificar que RESEND_API_KEY esté configurado
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }

    // Determinar el remitente según si el dominio está verificado
    // Si no tienes dominio verificado en Resend, usa el email verificado
    // Para producción, configura RESEND_FROM_EMAIL con un dominio verificado
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'weareimsoft@gmail.com'
    const fromName = 'imSoft'
    
    // Enviar email
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: quotation.client_email,
      subject: `Cotización: ${quotation.title || serviceName}`,
      html: html,
    })

    if (error) {
      console.error('Resend API error:', error)
      // Proporcionar más detalles del error
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : 'Error sending email'
      
      return NextResponse.json(
        { 
          error: 'Error sending email',
          details: errorMessage,
          // Solo incluir detalles en desarrollo
          ...(process.env.NODE_ENV === 'development' && { fullError: error })
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in send email route:', error)
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        // Solo incluir detalles en desarrollo
        ...(process.env.NODE_ENV === 'development' && { fullError: error })
      },
      { status: 500 }
    )
  }
}
