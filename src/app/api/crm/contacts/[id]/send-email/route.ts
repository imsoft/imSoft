import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Obtener el cuerpo de la petición
    const body = await request.json()
    const { subject, body: emailBody } = body

    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: 'Subject and body are required' },
        { status: 400 }
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

    // Verificar que RESEND_API_KEY esté configurado
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }

    // Determinar el remitente
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'contacto@imsoft.io'
    const fromName = 'imSoft'
    
    // Enviar email
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: contact.email,
      subject: subject,
      html: emailBody,
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
        },
        { status: 500 }
      )
    }

    // Registrar el email en la base de datos (si existe la tabla contact_emails)
    try {
      await supabase
        .from('contact_emails')
        .insert({
          contact_id: id,
          status: contact.status,
          subject: subject,
          body: emailBody,
          sent_by: user.id,
        })
    } catch (dbError) {
      // Si la tabla no existe, simplemente continuar (no crítico)
      console.warn('Could not log email to database:', dbError)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in send email route:', error)
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error occurred'

    return NextResponse.json(
      {
        error: 'Error sending email',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
