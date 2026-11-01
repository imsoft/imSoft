import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/roles'

// PUT: update a company
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Check the company exists and belongs to the user (or they're admin)
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('user_id, logo_url')
      .eq('id', id)
      .single()

    if (fetchError || !company) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      )
    }

    const admin = isAdmin(user)
    if (!admin && company.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para editar esta empresa' },
        { status: 403 }
      )
    }

    // Get the current logo_url before updating
    const { data: currentCompany } = await supabase
      .from('companies')
      .select('logo_url')
      .eq('id', id)
      .single()

    // If the logo is being updated, delete the previous logo from storage
    if (currentCompany?.logo_url && logo_url !== currentCompany.logo_url) {
      try {
        // Extract the file path from the URL
        const urlParts = currentCompany.logo_url.split('/')
        const logoIndex = urlParts.findIndex((part: string) => part === 'company-logos')
        
        if (logoIndex !== -1) {
          const fileNameWithFolder = urlParts.slice(logoIndex + 1).join('/')
          
          if (fileNameWithFolder) {
            const { error: deleteError } = await supabase.storage
              .from('company-logos')
              .remove([fileNameWithFolder])
            
            if (deleteError) {
              console.error('Error deleting old logo:', deleteError)
              // Don't fail the update if the previous logo can't be deleted
            }
          }
        }
      } catch (error) {
        console.error('Error deleting old logo:', error)
        // Continue with the update
      }
    }

    const { data, error } = await supabase
      .from('companies')
      .update({ 
        name: name.trim(),
        logo_url: logo_url || null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating company:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in companies PUT:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE: delete a company
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check the company exists and belongs to the user (or they're admin)
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('user_id, logo_url')
      .eq('id', id)
      .single()

    if (fetchError || !company) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      )
    }

    const admin = isAdmin(user)
    if (!admin && company.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar esta empresa' },
        { status: 403 }
      )
    }

    // Check for associated projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .eq('company_id', id)
      .limit(1)

    if (projectsError) {
      console.error('Error checking projects:', projectsError)
    }

    if (projects && projects.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una empresa que tiene proyectos asociados' },
        { status: 400 }
      )
    }

    // Delete the logo from storage if there is one
    if (company.logo_url) {
      try {
        const urlParts = company.logo_url.split('/')
        const logoIndex = urlParts.findIndex((part: string) => part === 'company-logos')
        
        if (logoIndex !== -1) {
          const fileNameWithFolder = urlParts.slice(logoIndex + 1).join('/')
          
          if (fileNameWithFolder) {
            const { error: deleteError } = await supabase.storage
              .from('company-logos')
              .remove([fileNameWithFolder])
            
            if (deleteError) {
              console.error('Error deleting logo:', deleteError)
              // Continue deleting the company even if deleting the logo fails
            }
          }
        }
      } catch (error) {
        console.error('Error deleting logo:', error)
        // Continue deleting the company
      }
    }

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting company:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in companies DELETE:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

