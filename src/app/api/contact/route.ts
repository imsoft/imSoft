import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, message } = body;

    // Validar datos requeridos
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Crear cliente de Supabase con SERVICE_ROLE_KEY para bypass de RLS
    // Esto es seguro porque estamos en una API route del servidor
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Guardar mensaje en la base de datos
    const { data: messageData, error: dbError } = await supabase
      .from('contact_messages')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email,
          phone_number: phoneNumber || null,
          message,
          status: 'unread'
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Error guardando mensaje:', dbError);
      return NextResponse.json(
        { 
          error: 'Error al guardar el mensaje',
          code: dbError.code,
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint
        },
        { status: 500 }
      );
    }

    // Obtener email del administrador desde la tabla contact
    const { data: contactData } = await supabase
      .from('contact')
      .select('email')
      .limit(1)
      .maybeSingle();

    const adminEmail = contactData?.email || 'contacto@imsoft.io';

    // Enviar email de notificación al administrador
    try {
      await resend.emails.send({
        from: 'imSoft Contact Form <weareimsoft@gmail.com>',
        to: adminEmail,
        replyTo: email,
        subject: `Nuevo mensaje de contacto de ${firstName} ${lastName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Nuevo Mensaje de Contacto</h1>
              </div>

              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h2 style="color: #667eea; margin-top: 0; font-size: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Información del Contacto</h2>

                  <table style="width: 100%; margin: 20px 0;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #555; width: 120px;">Nombre:</td>
                      <td style="padding: 8px 0;">${firstName} ${lastName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
                      <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></td>
                    </tr>
                    ${phoneNumber ? `
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #555;">Teléfono:</td>
                      <td style="padding: 8px 0;"><a href="tel:${phoneNumber}" style="color: #667eea; text-decoration: none;">${phoneNumber}</a></td>
                    </tr>
                    ` : ''}
                  </table>

                  <h3 style="color: #667eea; margin-top: 25px; font-size: 18px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Mensaje</h3>
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; white-space: pre-wrap;">${message}</div>

                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/admin/contact-messages"
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
                      Ver en el Dashboard
                    </a>
                  </div>
                </div>

                <p style="text-align: center; color: #777; font-size: 12px; margin-top: 20px;">
                  Este mensaje fue enviado desde el formulario de contacto de imSoft
                </p>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Error enviando email:', emailError);
      // No fallar la petición si el email falla, el mensaje ya está guardado en la BD
    }

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente',
      data: messageData
    });

  } catch (error) {
    console.error('Error en /api/contact:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
