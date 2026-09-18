import { NextResponse } from 'next/server';
import { getResend } from '@/lib/email/resend-client';
import { correoContacto } from '@/lib/email/plantillas';
import { createClient } from '@supabase/supabase-js';
import { verifyTurnstileToken } from '@/lib/turnstile';



export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, message, captchaToken } = body;

    // El apellido es opcional: para un primer contacto no aporta nada y exigirlo
    // cuesta envios. El formulario tampoco lo pide ya.
    if (!firstName || !email || !message) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar el captcha anti-bot antes de procesar nada.
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
      await getResend().emails.send({
        from: `imSoft <${fromEmail}>`,
        to: adminEmail,
        replyTo: email,
        ...correoContacto({
          nombre: [firstName, lastName].filter(Boolean).join(' '),
          email,
          telefono: phoneNumber,
          mensaje: message,
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
