import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ContactStatus } from '@/types/database'
import { isAdmin } from '@/lib/roles'

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

    // Check the user is admin
    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status } = body

    // Validate that status is valid
    const validStatuses: ContactStatus[] = ['no_contact', 'qualification', 'negotiation', 'closed_won', 'closed_lost']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update the contact's status
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
