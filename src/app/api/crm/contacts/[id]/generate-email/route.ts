import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    // Verificar que OPENAI_API_KEY esté configurado
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    // Obtener el contacto
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single()

    if (contactError || !contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    if (!contact.email) {
      return NextResponse.json(
        { error: 'Contact email is required' },
        { status: 400 }
      )
    }

    // Obtener historial de emails enviados en esta etapa
    const { data: emailHistory } = await supabase
      .from('contact_emails')
      .select('*')
      .eq('contact_id', id)
      .eq('status', contact.status)
      .order('sent_at', { ascending: false })
      .limit(10)

    // Obtener todos los servicios de imSoft para la etapa de Prospección
    const { data: allServicesData } = await supabase
      .from('services')
      .select('id, title_es, title_en, description_es, description_en')
      .order('created_at', { ascending: true })
    
    const allServices = allServicesData || []

    const contactName = `${contact.first_name} ${contact.last_name}`

    // Construir el prompt para ChatGPT
    const statusLabels: Record<string, string> = {
      no_contact: 'Sin Contacto',
      qualification: 'Prospección',
      negotiation: 'Negociación',
      closed_won: 'Ganado',
      closed_lost: 'Perdido',
    }

    const statusLabel = statusLabels[contact.status] || contact.status

    let emailHistoryText = ''
    if (emailHistory && emailHistory.length > 0) {
      emailHistoryText = `\n\nHistorial de emails enviados en esta etapa (${emailHistory.length} email${emailHistory.length > 1 ? 's' : ''}):\n`
      emailHistory.forEach((email, index) => {
        const date = new Date(email.sent_at).toLocaleDateString('es-MX')
        emailHistoryText += `${index + 1}. Fecha: ${date}\n   Asunto: ${email.subject}\n\n`
      })
      emailHistoryText += `\nIMPORTANTE: Este es el email #${emailHistory.length + 1} en esta etapa. Asegúrate de que el contenido sea diferente y progresivo, mostrando avance en la relación.`
    } else {
      emailHistoryText = '\n\nEste es el PRIMER email que se enviará en esta etapa. Debe ser un email inicial y profesional.'
    }

    // Construir texto de servicios para etapa de Prospección
    let servicesText = ''
    if (contact.status === 'qualification' && allServices.length > 0) {
      const servicesList = allServices.map((service: any, index: number) => {
        const title = service.title_es || service.title_en || 'Servicio'
        const description = service.description_es || service.description_en || ''
        return `${index + 1}. ${title}${description ? ` - ${description.substring(0, 150)}...` : ''}`
      }).join('\n')
      
      servicesText = `\n\nSERVICIOS DE IMSOFT (Para etapa de Prospección):
${servicesList}

IMPORTANTE PARA ETAPA DE PROSPECCIÓN:
- Debes incluir UNA idea o mejora específica para CADA servicio de imSoft listado arriba
- Cada idea debe ser relevante para la empresa "${contact.company || contactName}"
- Las ideas deben ser concretas, accionables y mostrar valor potencial
- Presenta las ideas de forma organizada (puedes usar una lista con viñetas)
- Después de presentar todas las ideas, incluye una LLAMADA A LA ACCIÓN clara que invite a:
  * Una reunión virtual (videollamada)
  * Una reunión presencial
  * Una llamada telefónica
- La llamada a la acción debe ser específica y ofrecer flexibilidad en el método de contacto
`
    }

    const prompt = `Eres un experto en comunicación comercial y ventas B2B. Genera un email personalizado y profesional en español para un cliente potencial.

INFORMACIÓN DE CONTACTO DE IMSOFT:
- Nombre: Brandon Uriel García Ramos
- Empresa: imSoft
- Email: contacto@imsoft.io
- Teléfono: 33 2536 5558

INFORMACIÓN DEL CONTACTO:
- Nombre: ${contactName}
- Empresa: ${contact.company || 'No especificada'}
- Email: ${contact.email}
${contact.phone ? `- Teléfono: ${contact.phone}` : ''}
- Estado Actual: ${statusLabel}
${contact.notes ? `- Notas sobre la empresa: ${contact.notes}` : ''}

${emailHistoryText}
${servicesText}

INSTRUCCIONES:
1. PRIMERO genera el cuerpo del email completo, luego crea un asunto que resuma perfectamente el contenido
2. El email debe estar firmado por Brandon Uriel García Ramos de imSoft
3. El tono debe ser apropiado para la etapa "${statusLabel}"
4. Si hay historial de emails, el nuevo email debe mostrar progreso y no repetir información
5. Incluye información específica del contacto para personalización
6. El email debe ser conciso pero completo${contact.status === 'qualification' ? ' (máximo 500 palabras en el cuerpo para incluir todas las ideas)' : ' (máximo 300 palabras en el cuerpo)'}
7. Incluye una llamada a la acción clara y relevante para la etapa${contact.status === 'qualification' ? ' (debe incluir opciones para reunión virtual, presencial o llamada telefónica)' : ''}
8. Al final del email, incluye una firma profesional con:
   - Nombre: Brandon Uriel García Ramos
   - Empresa: imSoft
   - Email: contacto@imsoft.io
   - Teléfono: 33 2536 5558

PROHIBICIONES ABSOLUTAS:
- NUNCA menciones dinero, precios, costos, valores monetarios, presupuestos, inversión, pagos, facturación, o cualquier referencia económica
- NO uses palabras como: precio, costo, valor, presupuesto, inversión, pago, factura, dinero, pesos, dólares, monto, tarifa, cuota, etc.
- NO menciones cantidades monetarias en ningún formato (ni en números ni en texto)
- El email debe enfocarse en beneficios, soluciones, valor agregado, resultados, pero SIN mencionar aspectos económicos

REGLAS PARA EL ASUNTO (CRÍTICO - DEBE SER MUY LLAMATIVO):
- El asunto DEBE ser EXTREMADAMENTE ATRACTIVO y generar curiosidad para que quieran abrirlo
- Debe mencionar el nombre de la empresa: "${contact.company || contactName}" o hacer referencia clara a él
- Debe ser específico, personalizado y relacionado con el contenido del email
- MÁXIMO 60 caracteres (más corto = mejor)
- Usa técnicas de copywriting para aumentar aperturas:
  * Preguntas que generen curiosidad: "¿Listo para [beneficio]?"
  * Números o datos específicos: "3 formas de [beneficio] para ${contact.company || contactName}"
  * Urgencia o escasez: "Última oportunidad: [beneficio]"
  * Beneficios claros: "Cómo [beneficio] puede transformar ${contact.company || contactName}"
  * Personalización: "Solución personalizada para ${contact.company || contactName}"
  * Emojis estratégicos (máximo 1-2): 🚀 💡 ⚡ 🎯
- Ejemplos MUY BUENOS (llamativos y que generan apertura):
  * "🚀 ${contact.company || contactName}: Tu solución está lista"
  * "¿Listo para transformar ${contact.company || contactName}? Propuesta exclusiva"
  * "3 razones por las que ${contact.company || contactName} necesita esto"
  * "Solución personalizada para ${contact.company || contactName}"
  * "Último paso para cerrar con ${contact.company || contactName} - ${statusLabel}"
  * "💡 Idea exclusiva para ${contact.company || contactName}"
  * "¿${contact.company || contactName}? Te muestro cómo lograrlo"
- Ejemplos MALOS (NO usar - muy genéricos):
  * "Hola" o "Seguimiento" o "Email importante"
  * "Propuesta" (sin contexto)
  * "Actualización" (muy genérico)
  * Cualquier asunto que no genere curiosidad o interés
- IMPORTANTE: El asunto debe hacer que el destinatario piense "Necesito abrir esto AHORA"

IMPORTANTE: 
- El email debe estar en formato HTML válido
- Usa etiquetas HTML apropiadas: <h2>, <p>, <strong>, <ul>, <li>, etc.
- NO incluyas el header/footer de imSoft (solo el contenido del cuerpo)
- El estilo debe ser inline cuando sea necesario
- El asunto y el cuerpo deben estar perfectamente alineados en contenido y propósito

Responde SOLO con un JSON válido con esta estructura:
{
  "subject": "Asunto del email que refleje el contenido del cuerpo",
  "body": "Cuerpo del email en HTML (sin header/footer, solo el contenido principal)"
}`

    // Llamar a ChatGPT
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en comunicación comercial B2B, copywriting y generación de emails de ventas personalizados con ALTA tasa de apertura. CRÍTICO: El asunto del email DEBE ser EXTREMADAMENTE LLAMATIVO y generar curiosidad. Usa técnicas de copywriting: preguntas, números, beneficios claros, urgencia, personalización. PROHIBIDO ABSOLUTAMENTE: NO menciones dinero, precios, costos, valores monetarios, presupuestos, inversión, pagos, facturación, o cualquier referencia económica en el asunto NI en el cuerpo del email. El email debe enfocarse en beneficios, soluciones y valor agregado sin mencionar aspectos económicos. Primero piensa en el contenido del email, luego crea un asunto que sea irresistible y que haga que quieran abrirlo INMEDIATAMENTE. El asunto debe reflejar el contenido pero de forma MUY ATRACTIVA. Siempre respondes en formato JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No se recibió respuesta de OpenAI')
    }

    let emailData
    try {
      emailData = JSON.parse(responseText)
    } catch (parseError) {
      // Si falla el parseo, intentar extraer JSON del texto
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        emailData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No se pudo parsear la respuesta de OpenAI')
      }
    }

    // Generar el HTML completo del email con el template de imSoft
    const primaryColor = '#1e9df1'
    const fullHtml = `
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
              ${emailData.body || ''}
            </div>

            <!-- Llamadas a la Acción -->
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
              <h2 style="color: ${primaryColor}; margin-top: 0; font-size: 20px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 10px; text-align: center;">¿Cómo podemos ayudarte?</h2>
              <p style="text-align: center; color: #555; margin-bottom: 20px;">Estamos aquí para ayudarte. Elige la forma que prefieras para contactarnos:</p>

              <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 auto;">
                <tr>
                  <td style="text-align: center; padding: 10px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <!-- Botón WhatsApp -->
                        <td style="padding-right: 15px;">
                          <a href="https://wa.me/523325365558?text=${encodeURIComponent(`Hola, soy ${contactName}${contact.company ? ` de ${contact.company}` : ''} y tengo una pregunta.`)}"
                             style="display: inline-block; background: #25D366; color: white; text-align: center; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; white-space: nowrap;">
                            💬 WhatsApp
                          </a>
                        </td>
                        <!-- Botón Email -->
                        <td style="padding-right: 15px;">
                          <a href="mailto:contacto@imsoft.io?subject=${encodeURIComponent(`Consulta de: ${contactName}`)}&body=${encodeURIComponent(`Hola, soy ${contactName}${contact.company ? ` de ${contact.company}` : ''} y tengo una pregunta.`)}"
                             style="display: inline-block; background: ${primaryColor}; color: white; text-align: center; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; white-space: nowrap;">
                            ✉️ Email
                          </a>
                        </td>
                        <!-- Botón Formulario de Contacto -->
                        <td>
                          <a href="https://imsoft.io/contact"
                             style="display: inline-block; background: #6B7280; color: white; text-align: center; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; white-space: nowrap;">
                            📝 Formulario
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Disclaimer y Firma -->
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; vertical-align: middle;">
              <p style="font-size: 12px; color: #666; margin: 0 0 15px 0; line-height: 1.5;">
                Este es un correo automático de imSoft. Por favor, no responda a este correo.
              </p>
              <table cellpadding="0" cellspacing="0" border="0" style="font-family: Geist, Geist_Mono, -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Arial, sans-serif; color:#0b0b0b; margin: 0 auto;">
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

                    <!-- SERVICIOS -->
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

    return NextResponse.json({
      success: true,
      subject: emailData.subject || '',
      body: fullHtml,
    })
  } catch (error) {
    console.error('Error in generate email route:', error)
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error occurred'

    return NextResponse.json(
      {
        error: 'Error generating email',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
