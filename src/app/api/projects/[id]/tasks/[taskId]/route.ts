import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * PATCH /api/projects/[id]/tasks/[taskId]
 * Actualiza una tarea (título, descripción, completada, orden)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id: projectId, taskId } = await params
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
    const { title, description, completed, order_index, priority, category } = body

    // Obtener el estado anterior de la tarea
    const { data: previousTask } = await supabase
      .from('project_tasks')
      .select('completed, title')
      .eq('id', taskId)
      .single()

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (priority !== undefined) updateData.priority = priority || null
    if (category !== undefined) updateData.category = category || null
    if (completed !== undefined) {
      updateData.completed = completed
      if (completed) {
        updateData.completed_at = new Date().toISOString()
      } else {
        // Si se desmarca como completada, limpiar completed_at
        updateData.completed_at = null
      }
    }
    if (order_index !== undefined) updateData.order_index = order_index

    const { data: task, error } = await supabase
      .from('project_tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error

    // Si la tarea se marcó como completada (cambió de false a true), enviar notificación
    if (completed === true && previousTask && !previousTask.completed) {
      // Enviar email de notificación de manera asíncrona (no bloqueante)
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/task-completed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
        body: JSON.stringify({
          projectId,
          taskId,
          taskTitle: task.title,
        }),
      }).catch(emailError => {
        console.error('Failed to send email notification:', emailError)
        // No falla la operación si el email falla
      })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects/[id]/tasks/[taskId]
 * Elimina una tarea
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { taskId } = await params
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

    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', taskId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
