import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { stage } = body

    if (!stage) {
      return NextResponse.json(
        { error: 'Stage is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar autenticación
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

    // Actualizar el stage del deal
    const { data, error } = await supabase
      .from('deals')
      .update({
        stage,
        updated_at: new Date().toISOString(),
        // Si se marca como closed_won, guardar la fecha de cierre
        ...(stage === 'closed_won' && { actual_close_date: new Date().toISOString() }),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating deal stage:', error)
      return NextResponse.json(
        { error: 'Failed to update deal stage' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in PATCH /api/crm/deals/[id]/stage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
