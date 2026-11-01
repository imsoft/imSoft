import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/roles'

// GET: all companies, or the companies of a specific user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admins can see every company (with or without a user) or filter by user_id
    // Clients can only see their own companies
    const admin = isAdmin(user)
    
    let data, error

    if (admin) {
      // For admins, use the regular client with RLS (the policies should allow seeing all)
      let query = supabase.from('companies').select('*').order('name', { ascending: true })
      
      // Admins can filter by user_id if given
      if (userId) {
        query = query.eq('user_id', userId)
      }
      
      const result = await query
      data = result.data
      error = result.error
      
      // On a permissions error, fall back to the admin client
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
      // Clients only see their own companies
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
      // If the table doesn't exist, return a clearer message
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

// POST: create a new company
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

    // Clients can only create companies for themselves
    // Admins can create companies for any user or with no user (user_id = null)
    const admin = isAdmin(user)
    let targetUserId: string | null = null
    
    if (admin) {
      // Admins can set user_id or leave it null
      targetUserId = body.user_id || null
    } else {
      // Clients can only create for themselves
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

