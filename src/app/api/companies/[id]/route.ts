import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PUT: Actualizar una empresa
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

    // Verificar que la empresa existe y pertenece al usuario (o es admin)
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

    const isAdmin = user.user_metadata?.role === 'admin'
    if (!isAdmin && company.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para editar esta empresa' },
        { status: 403 }
      )
    }

    // Obtener el logo_url actual antes de actualizar
    const { data: currentCompany } = await supabase
      .from('companies')
      .select('logo_url')
      .eq('id', id)
      .single()

    // Si se está actualizando el logo, eliminar el logo anterior del storage
    if (currentCompany?.logo_url && logo_url !== currentCompany.logo_url) {
      try {
        // Extraer la ruta del archivo de la URL
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
              // No fallar la actualización si no se puede eliminar el logo anterior
            }
          }
        }
      } catch (error) {
        console.error('Error deleting old logo:', error)
        // Continuar con la actualización
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

// DELETE: Eliminar una empresa
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

    // Verificar que la empresa existe y pertenece al usuario (o es admin)
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

    const isAdmin = user.user_metadata?.role === 'admin'
    if (!isAdmin && company.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar esta empresa' },
        { status: 403 }
      )
    }

    // Verificar si hay proyectos asociados
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

    // Eliminar el logo del storage si existe
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
              // Continuar con la eliminación de la empresa aunque falle la eliminación del logo
            }
          }
        }
      } catch (error) {
        console.error('Error deleting logo:', error)
        // Continuar con la eliminación de la empresa
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

