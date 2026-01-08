import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { avatar_url } = body

    const supabaseAdmin = createAdminClient()

    // Actualizar user_metadata con la nueva URL del avatar
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          avatar_url: avatar_url || null,
        },
      }
    )

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ user: data.user }, { status: 200 })
  } catch (error) {
    console.error('Error updating avatar:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el avatar' },
      { status: 500 }
    )
  }
}

