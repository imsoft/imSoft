import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET: Obtener todas las empresas o empresas de un usuario específico
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Si es admin, puede ver todas las empresas (con o sin usuario) o filtrar por user_id
    // Si es cliente, solo puede ver sus propias empresas
    const isAdmin = user.user_metadata?.role === 'admin'
    
    let data, error

    if (isAdmin) {
      // Para admins, usar el cliente normal con RLS (las políticas deberían permitir ver todas)
      let query = supabase.from('companies').select('*').order('name', { ascending: true })
      
      // Admin puede filtrar por user_id si se especifica
      if (userId) {
        query = query.eq('user_id', userId)
      }
      
      const result = await query
      data = result.data
      error = result.error
      
      // Si hay error de permisos, intentar con admin client como fallback
      if (error && (error.code === '42501' || error.message?.includes('permission denied'))) {
        console.warn('RLS blocked admin access, using admin client as fallback')
        const supabaseAdmin = createAdminClient()
        let adminQuery = supabaseAdmin.from('companies').select('*').order('name', { ascending: true })
        
        if (userId) {
          adminQuery = adminQuery.eq('user_id', userId)
        }
        
        const adminResult = await adminQuery
        data = adminResult.data
        error = adminResult.error
      }
    } else {
      // Cliente solo ve sus propias empresas
      const result = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })
      
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Error fetching companies:', error)
      // Si la tabla no existe, devolver un mensaje más claro
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'La tabla de empresas no existe. Por favor, crea la tabla "companies" en Supabase siguiendo las instrucciones en docs/COMPANIES_SETUP.md',
            code: 'TABLE_NOT_FOUND'
          },
          { status: 404 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in companies GET:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST: Crear una nueva empresa
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, logo_url } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'El nombre de la empresa es requerido' },
        { status: 400 }
      )
    }

    // Los clientes solo pueden crear empresas para sí mismos
    // Los admins pueden crear empresas para cualquier usuario o sin usuario (user_id = null)
    const isAdmin = user.user_metadata?.role === 'admin'
    let targetUserId: string | null = null
    
    if (isAdmin) {
      // Si es admin, puede especificar user_id o dejarlo null
      targetUserId = body.user_id || null
    } else {
      // Si es cliente, solo puede crear para sí mismo
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('companies')
      .insert([{ 
        name: name.trim(), 
        user_id: targetUserId,
        logo_url: logo_url || null
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating company:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in companies POST:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

