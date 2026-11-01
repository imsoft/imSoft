import { NextResponse } from 'next/server';
import { getResend } from '@/lib/email/resend-client';
import { contactEmail } from '@/lib/email/templates';
import { createClient } from '@supabase/supabase-js';
import { verifyTurnstileToken } from '@/lib/turnstile';



export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, message, captchaToken } = body;

    // Last name is optional: it adds nothing to a first contact and requiring it
    // costs submissions. The form no longer asks for it either.
    if (!firstName || !email || !message) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verify the anti-bot captcha before processing anything.
    const remoteIp = request.headers.get('cf-connecting-ip')
      || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || undefined;
    const captchaOk = await verifyTurnstileToken(captchaToken, remoteIp);
    if (!captchaOk) {
      return NextResponse.json(
        { error: 'Verificación de seguridad fallida. Recarga la página e inténtalo de nuevo.' },
        { status: 400 }
      );
    }

    // Create a Supabase client with SERVICE_ROLE_KEY to bypass RLS
    // This is safe because we're in a server API route
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Save the message in the database
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

    // Get the admin email from the contact table
    const { data: contactData } = await supabase
      .from('contact')
      .select('email')
      .limit(1)
      .maybeSingle();

    const adminEmail = contactData?.email || 'contacto@imsoft.io';

    // Send the notification email to the admin
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'contacto@imsoft.io';

    try {
      await getResend().emails.send({
        from: `imSoft <${fromEmail}>`,
        to: adminEmail,
        replyTo: email,
        ...contactEmail({
          name: [firstName, lastName].filter(Boolean).join(' '),
          email,
          phone: phoneNumber,
          message,
          panelUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io'}/es/dashboard/admin/contact-messages`,
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
      // The message is already saved in the DB: return success but warn
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
