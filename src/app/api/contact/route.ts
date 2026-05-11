import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

function buildContactEmailHtml({
  firstName,
  lastName,
  email,
  phoneNumber,
  message,
  dashboardUrl,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  message: string;
  dashboardUrl: string;
}): string {
  const BRAND = '#6366f1';
  const BRAND_DARK = '#4f46e5';
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nuevo mensaje de contacto — imSoft</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0f172a;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <img
                src="${SITE_URL}/logos/logo-imsoft-blue.png"
                alt="imSoft"
                width="120"
                style="display:block;margin:0 auto 20px;height:auto;"
              />
              <div style="display:inline-block;background-color:${BRAND};border-radius:100px;padding:4px 16px;margin-bottom:12px;">
                <span style="color:#fff;font-size:12px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">Formulario de Contacto</span>
              </div>
              <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;line-height:1.3;">
                Nuevo mensaje de <span style="color:#a5b4fc;">${firstName} ${lastName}</span>
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:36px 40px;">

              <!-- Contact info -->
              <h2 style="margin:0 0 16px;font-size:13px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.08em;">Datos del contacto</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:28px;">
                <tr style="background-color:#f8fafc;">
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;width:110px;border-bottom:1px solid #e2e8f0;">Nombre</td>
                  <td style="padding:12px 16px;font-size:14px;color:#0f172a;font-weight:500;border-bottom:1px solid #e2e8f0;">${firstName} ${lastName}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;border-bottom:${phoneNumber ? '1px solid #e2e8f0' : 'none'};">Email</td>
                  <td style="padding:12px 16px;border-bottom:${phoneNumber ? '1px solid #e2e8f0' : 'none'};">
                    <a href="mailto:${email}" style="color:${BRAND};font-size:14px;text-decoration:none;font-weight:500;">${email}</a>
                  </td>
                </tr>
                ${phoneNumber ? `
                <tr style="background-color:#f8fafc;">
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;">Teléfono</td>
                  <td style="padding:12px 16px;">
                    <a href="tel:${phoneNumber}" style="color:${BRAND};font-size:14px;text-decoration:none;font-weight:500;">${phoneNumber}</a>
                  </td>
                </tr>` : ''}
              </table>

              <!-- Message -->
              <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.08em;">Mensaje</h2>
              <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid ${BRAND};border-radius:0 8px 8px 0;padding:16px 20px;font-size:14px;line-height:1.7;color:#334155;white-space:pre-wrap;margin-bottom:32px;">${message}</div>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:8px;">
                <a href="${dashboardUrl}"
                   style="display:inline-block;background-color:${BRAND};color:#ffffff;padding:13px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.01em;">
                  Ver en el Dashboard →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0f172a;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#475569;">
                Recibiste este correo porque alguien completó el formulario en
                <a href="${SITE_URL}" style="color:#a5b4fc;text-decoration:none;">imsoft.io</a>
              </p>
              <p style="margin:0;font-size:12px;color:#334155;">
                © ${new Date().getFullYear()} imSoft · Todos los derechos reservados
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

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
        { error: 'Error al guardar el mensaje' },
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
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'contacto@imsoft.io';

    try {
      await resend.emails.send({
        from: `imSoft <${fromEmail}>`,
        to: adminEmail,
        replyTo: email,
        subject: `Nuevo mensaje de ${firstName} ${lastName} — imSoft`,
        html: buildContactEmailHtml({
          firstName,
          lastName,
          email,
          phoneNumber,
          message,
          dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/es/dashboard/admin/contact-messages`,
        }),
      });
    } catch (emailError: any) {
      console.error('Error enviando email con Resend:', {
        message: emailError?.message,
        statusCode: emailError?.statusCode,
        name: emailError?.name,
        from: fromEmail,
        to: adminEmail,
      });
      // El mensaje ya está guardado en BD — devolvemos éxito pero avisamos
      return NextResponse.json({
        success: true,
        message: 'Mensaje guardado. Hubo un problema al enviar la notificación por email.',
        emailSent: false,
        data: messageData,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente',
      emailSent: true,
      data: messageData,
    });

  } catch (error) {
    console.error('Error en /api/contact:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
