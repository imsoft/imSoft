import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { final_price, estimated_development_time } = body

    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verificar que sea admin
    if (user.user_metadata?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Validar que la cotización existe
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select('id')
      .eq('id', id)
      .single()

    if (quotationError || !quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      )
    }

    // Construir objeto de actualización
    const updateData: any = {}
    
    if (final_price !== undefined) {
      if (typeof final_price !== 'number' || final_price < 0) {
        return NextResponse.json(
          { error: 'final_price must be a positive number' },
          { status: 400 }
        )
      }
      updateData.final_price = final_price
    }

    if (estimated_development_time !== undefined) {
      if (typeof estimated_development_time !== 'number' || estimated_development_time < 0) {
        return NextResponse.json(
          { error: 'estimated_development_time must be a positive number' },
          { status: 400 }
        )
      }
      updateData.estimated_development_time = estimated_development_time
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Actualizar la cotización
    const { data, error } = await supabase
      .from('quotations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating quotation:', error)
      return NextResponse.json(
        { error: 'Error updating quotation' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in update admin fields route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
