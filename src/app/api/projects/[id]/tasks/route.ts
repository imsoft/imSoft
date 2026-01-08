import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { ProjectTask } from '@/types/database'

/**
 * GET /api/projects/[id]/tasks
 * Obtiene todas las tareas de un proyecto
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener tareas del proyecto ordenadas por order_index
    const { data: tasks, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', id)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching tasks:', error)
      // Si es un error de permisos RLS, devolver un mensaje más claro
      if (error.code === '42501' || error.message?.includes('permission denied')) {
        return NextResponse.json(
          { error: 'Permission denied. Please check RLS policies.' },
          { status: 403 }
        )
      }
      throw error
    }

    return NextResponse.json(tasks || [])
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects/[id]/tasks
 * Crea una nueva tarea para un proyecto
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar que el usuario es admin
    const role = user.user_metadata?.role
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, priority, category } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Obtener el siguiente order_index
    const { data: existingTasks } = await supabase
      .from('project_tasks')
      .select('order_index')
      .eq('project_id', id)
      .order('order_index', { ascending: false })
      .limit(1)

    const nextOrderIndex = existingTasks && existingTasks.length > 0
      ? existingTasks[0].order_index + 1
      : 0

    const { data: task, error } = await supabase
      .from('project_tasks')
      .insert([
        {
          project_id: id,
          title,
          description: description || null,
          priority: priority || null,
          category: category || null,
          completed: false,
          order_index: nextOrderIndex,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
