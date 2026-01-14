import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Templates de email basados en el estado del deal
const getEmailTemplate = (stage: string, dealTitle: string, contactName: string, dealValue: number, lang: 'en' | 'es' = 'es') => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const primaryColor = '#1e9df1'

  const templates: Record<string, { subject: { en: string; es: string }, content: { en: string; es: string } }> = {
    qualification: {
      subject: {
        en: `Thank you for your interest - ${dealTitle}`,
        es: `Gracias por tu interés - ${dealTitle}`
      },
      content: {
        en: `
          <h2 style="color: ${primaryColor}; margin-top: 0;">Thank you for your interest!</h2>
          <p>Dear ${contactName},</p>
          <p>We have received your inquiry regarding <strong>${dealTitle}</strong> valued at <strong>${formatCurrency(dealValue)}</strong>.</p>
          <p>Our team is currently reviewing your request and we will get back to you shortly with more information and next steps.</p>
          <p>If you have any questions in the meantime, please don't hesitate to reach out.</p>
        `,
        es: `
          <h2 style="color: ${primaryColor}; margin-top: 0;">¡Gracias por tu interés!</h2>
          <p>Estimado/a ${contactName},</p>
          <p>Hemos recibido tu solicitud respecto a <strong>${dealTitle}</strong> con un valor de <strong>${formatCurrency(dealValue)}</strong>.</p>
          <p>Nuestro equipo está revisando tu solicitud y te contactaremos en breve con más información y los siguientes pasos.</p>
          <p>Si tienes alguna pregunta mientras tanto, no dudes en contactarnos.</p>
        `
      }
    },
    proposal: {
      subject: {
        en: `Your Proposal is Ready - ${dealTitle}`,
        es: `Tu Propuesta está Lista - ${dealTitle}`
      },
      content: {
        en: `
          <h2 style="color: ${primaryColor}; margin-top: 0;">Your Proposal is Ready!</h2>
          <p>Dear ${contactName},</p>
          <p>We are pleased to present our proposal for <strong>${dealTitle}</strong>.</p>
          <p><strong>Proposed Value:</strong> ${formatCurrency(dealValue)}</p>
          <p>Our proposal includes a detailed breakdown of deliverables, timeline, and terms. We believe this solution will meet your needs perfectly.</p>
          <p>Please review the attached information and let us know if you have any questions or would like to schedule a call to discuss further.</p>
        `,
        es: `
          <h2 style="color: ${primaryColor}; margin-top: 0;">¡Tu Propuesta está Lista!</h2>
          <p>Estimado/a ${contactName},</p>
          <p>Nos complace presentarte nuestra propuesta para <strong>${dealTitle}</strong>.</p>
          <p><strong>Valor Propuesto:</strong> ${formatCurrency(dealValue)}</p>
          <p>Nuestra propuesta incluye un desglose detallado de entregables, cronograma y términos. Creemos que esta solución se ajusta perfectamente a tus necesidades.</p>
          <p>Por favor revisa la información adjunta y déjanos saber si tienes alguna pregunta o si deseas agendar una llamada para discutir más detalles.</p>
        `
      }
    },
    negotiation: {
      subject: {
        en: `Let's Finalize the Details - ${dealTitle}`,
        es: `Finalizemos los Detalles - ${dealTitle}`
      },
      content: {
        en: `
          <h2 style="color: ${primaryColor}; margin-top: 0;">Let's Finalize the Details</h2>
          <p>Dear ${contactName},</p>
          <p>We're excited to be in the final stages of negotiation for <strong>${dealTitle}</strong>.</p>
          <p><strong>Current Value:</strong> ${formatCurrency(dealValue)}</p>
          <p>We want to ensure all your requirements are met and that we're aligned on the scope, timeline, and terms.</p>
          <p>Let's schedule a meeting to finalize the remaining details and move forward with the project.</p>
        `,
        es: `
          <h2 style="color: ${primaryColor}; margin-top: 0;">Finalizemos los Detalles</h2>
          <p>Estimado/a ${contactName},</p>
          <p>Estamos emocionados de estar en las etapas finales de negociación para <strong>${dealTitle}</strong>.</p>
          <p><strong>Valor Actual:</strong> ${formatCurrency(dealValue)}</p>
          <p>Queremos asegurarnos de que todos tus requisitos estén cubiertos y que estemos alineados en el alcance, cronograma y términos.</p>
          <p>Agendemos una reunión para finalizar los detalles restantes y avanzar con el proyecto.</p>
        `
      }
    },
    closed_won: {
      subject: {
        en: `Welcome Aboard! - ${dealTitle}`,
        es: `¡Bienvenido a Bordo! - ${dealTitle}`
      },
      content: {
        en: `
          <h2 style="color: ${primaryColor}; margin-top: 0;">🎉 Welcome Aboard!</h2>
          <p>Dear ${contactName},</p>
          <p>We are thrilled to officially welcome you as our client for <strong>${dealTitle}</strong>!</p>
          <p><strong>Project Value:</strong> ${formatCurrency(dealValue)}</p>
          <p>Our team is ready to begin work and deliver exceptional results. You will receive:</p>
          <ul>
            <li>A detailed project kickoff plan</li>
            <li>Access to our project management platform</li>
            <li>Regular updates on progress</li>
            <li>Dedicated support throughout the project</li>
          </ul>
          <p>Thank you for choosing imSoft. We look forward to a successful partnership!</p>
        `,
        es: `
          <h2 style="color: ${primaryColor}; margin-top: 0;">🎉 ¡Bienvenido a Bordo!</h2>
          <p>Estimado/a ${contactName},</p>
          <p>¡Estamos emocionados de oficialmente darte la bienvenida como nuestro cliente para <strong>${dealTitle}</strong>!</p>
          <p><strong>Valor del Proyecto:</strong> ${formatCurrency(dealValue)}</p>
          <p>Nuestro equipo está listo para comenzar a trabajar y entregar resultados excepcionales. Recibirás:</p>
          <ul>
            <li>Un plan detallado de inicio del proyecto</li>
            <li>Acceso a nuestra plataforma de gestión de proyectos</li>
            <li>Actualizaciones regulares sobre el progreso</li>
            <li>Soporte dedicado durante todo el proyecto</li>
          </ul>
          <p>Gracias por elegir imSoft. ¡Esperamos una colaboración exitosa!</p>
        `
      }
    },
    closed_lost: {
      subject: {
        en: `Thank you for considering us - ${dealTitle}`,
        es: `Gracias por considerarnos - ${dealTitle}`
      },
      content: {
        en: `
          <h2 style="color: ${primaryColor}; margin-top: 0;">Thank You for Your Time</h2>
          <p>Dear ${contactName},</p>
          <p>We understand that you've decided to pursue a different direction for <strong>${dealTitle}</strong>.</p>
          <p>We appreciate the time you invested in considering our proposal. While we're disappointed we won't be working together on this project, we respect your decision.</p>
          <p>If circumstances change or if you have future projects where we might be a good fit, please don't hesitate to reach out. We'd love the opportunity to work with you in the future.</p>
          <p>We wish you all the best with your project!</p>
        `,
        es: `
          <h2 style="color: ${primaryColor}; margin-top: 0;">Gracias por tu Tiempo</h2>
          <p>Estimado/a ${contactName},</p>
          <p>Entendemos que has decidido tomar una dirección diferente para <strong>${dealTitle}</strong>.</p>
          <p>Apreciamos el tiempo que invertiste en considerar nuestra propuesta. Aunque estamos decepcionados de no poder trabajar juntos en este proyecto, respetamos tu decisión.</p>
          <p>Si las circunstancias cambian o si tienes proyectos futuros donde podamos ser una buena opción, no dudes en contactarnos. Nos encantaría tener la oportunidad de trabajar contigo en el futuro.</p>
          <p>¡Te deseamos lo mejor con tu proyecto!</p>
        `
      }
    }
  }

  return templates[stage] || templates.qualification
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea admin
    if (user.user_metadata?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Obtener el deal con el contacto
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select(`
        *,
        contacts (
          id,
          first_name,
          last_name,
          email,
          company
        )
      `)
      .eq('id', id)
      .single()

    if (dealError || !deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    if (!deal.contacts?.email) {
      return NextResponse.json(
        { error: 'Contact email is required' },
        { status: 400 }
      )
    }

    // Verificar que RESEND_API_KEY esté configurado
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }

    const contactName = `${deal.contacts.first_name} ${deal.contacts.last_name}`
    const template = getEmailTemplate(deal.stage, deal.title, contactName, deal.value, 'es')

    const primaryColor = '#1e9df1'

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
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Soluciones digitales a la medida</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
              ${template.content.es}
            </div>

            <!-- Llamadas a la Acción -->
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
              <h2 style="color: ${primaryColor}; margin-top: 0; font-size: 20px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 10px; text-align: center;">¿Tienes Preguntas?</h2>
              <p style="text-align: center; color: #555; margin-bottom: 20px;">Estamos aquí para ayudarte. Elige la forma que prefieras para contactarnos:</p>

              <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 auto;">
                <tr>
                  <td style="text-align: center; padding: 10px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <!-- Botón WhatsApp -->
                        <td style="padding-right: 15px;">
                          <a href="https://wa.me/523325365558?text=${encodeURIComponent(`Hola, soy ${contactName}${deal.contacts.company ? ` de ${deal.contacts.company}` : ''} y tengo una pregunta sobre: ${deal.title}.`)}"
                             style="display: inline-block; background: #25D366; color: white; text-align: center; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; white-space: nowrap;">
                            💬 WhatsApp
                          </a>
                        </td>
                        <!-- Botón Email -->
                        <td style="padding-right: 15px;">
                          <a href="mailto:weareimsoft@gmail.com?subject=${encodeURIComponent(`Consulta sobre: ${deal.title}`)}&body=${encodeURIComponent(`Hola,\n\nSoy ${contactName}${deal.contacts.company ? ` de ${deal.contacts.company}` : ''} y tengo una pregunta sobre: ${deal.title}.\n\nSaludos,\n${contactName}`)}"
                             style="display: inline-block; background: ${primaryColor}; color: white; text-align: center; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; white-space: nowrap;">
                            ✉️ Email
                          </a>
                        </td>
                        <!-- Botón Contacto -->
                        <td>
                          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io'}/es/contact"
                             style="display: inline-block; background: #f8f9fa; color: ${primaryColor}; text-align: center; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; border: 2px solid ${primaryColor}; white-space: nowrap;">
                            📋 Contacto
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>

            <div style="background: white; text-align: center; margin-top: 30px; padding: 30px 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
              <p style="margin: 0 0 8px 0;">Este es un correo automático de imSoft. Por favor, no responda a este correo.</p>
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">Para cualquier consulta, utiliza los botones de contacto arriba.</p>
            </div>

            <!-- Firma Electrónica -->
            <div style="background: white; margin-top: 40px; padding: 30px; border-top: 2px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0" border="0" style="font-family: Geist, Geist_Mono, -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Arial, sans-serif; color:#0b0b0b; width: 100%;">
                <tr>
                  <td style="padding-right:16px; vertical-align:top;">
                    <img
                      src="https://res.cloudinary.com/https-imsoft-io/image/upload/v1740963749/imsoft-images/imsoft/logo-imsoft-blue.png"
                      alt="imSoft"
                      height="145"
                      style="display:block; border:0; outline:none; height:145px; width:auto;"
                    />
                  </td>

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
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </body>
      </html>
    `

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'weareimsoft@gmail.com'
    const fromName = 'imSoft'

    // Enviar email
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: deal.contacts.email,
      subject: template.subject.es,
      html: html,
    })

    if (error) {
      console.error('Resend API error:', error)
      const errorMessage = error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : 'Error sending email'

      return NextResponse.json(
        {
          error: 'Error sending email',
          details: errorMessage,
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
        ...(process.env.NODE_ENV === 'development' && { fullError: error })
      },
      { status: 500 }
    )
  }
}
