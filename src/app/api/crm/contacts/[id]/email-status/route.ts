import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
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

    const body = await request.json()
    const { email, isInvalid } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const targetEmail = email.trim().toLowerCase()

    // Obtener el contacto para ver su estado actual
    const { data: contact, error: fetchError } = await supabase
      .from('contacts')
      .select('invalid_emails')
      .eq('id', id)
      .single()

    if (fetchError || !contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    const currentInvalidEmails: string[] = contact.invalid_emails || []
    let updatedInvalidEmails: string[] = []

    if (isInvalid) {
      // Agregar a inválidos si no existe
      if (!currentInvalidEmails.some(e => e.toLowerCase() === targetEmail)) {
        updatedInvalidEmails = [...currentInvalidEmails, email.trim()]
      } else {
        updatedInvalidEmails = currentInvalidEmails
      }
    } else {
      // Eliminar de inválidos
      updatedInvalidEmails = currentInvalidEmails.filter(
        e => e.toLowerCase() !== targetEmail
      )
    }

    // Actualizar en base de datos
    const { error: updateError } = await supabase
      .from('contacts')
      .update({
        invalid_emails: updatedInvalidEmails,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating contact invalid emails:', updateError)
      return NextResponse.json(
        { error: 'Failed to update email status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, invalidEmails: updatedInvalidEmails })
  } catch (error) {
    console.error('Error in PATCH /api/crm/contacts/[id]/email-status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
