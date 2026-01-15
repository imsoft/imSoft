import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ContactStatus } from '@/types/database'

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
    const { status } = body

    // Validar que status sea válido
    const validStatuses: ContactStatus[] = ['no_contact', 'qualification', 'negotiation', 'closed_won', 'closed_lost']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Actualizar el estado del contacto
    const { error } = await supabase
      .from('contacts')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating contact status:', error)
      return NextResponse.json(
        { error: 'Failed to update contact status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PATCH /api/crm/contacts/[id]/status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
