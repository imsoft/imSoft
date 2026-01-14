import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ContactType } from '@/types/database'

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
    const { contact_type } = body

    // Validar que contact_type sea válido
    const validTypes: ContactType[] = ['lead', 'prospect', 'customer', 'partner']
    if (!contact_type || !validTypes.includes(contact_type)) {
      return NextResponse.json(
        { error: 'Invalid contact_type' },
        { status: 400 }
      )
    }

    // Actualizar el tipo de contacto
    const { error } = await supabase
      .from('contacts')
      .update({
        contact_type,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating contact type:', error)
      return NextResponse.json(
        { error: 'Failed to update contact type' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PATCH /api/crm/contacts/[id]/type:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
