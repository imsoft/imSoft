import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { roleOf } from '@/lib/roles'
import { serviceClient } from '@/lib/quotes/server'
import { notifyClient, taskCompletedNotice } from '@/lib/mobile-app/notifications'

/**
 * PATCH /api/projects/[id]/tasks/[taskId]
 * Updates a task (title, description, completed, order)
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

    // Check the user is admin
    const role = roleOf(user)
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, completed, order_index, priority, category } = body

    // Get the task's previous state
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
        // If it's unchecked as completed, clear completed_at
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

    // If the task was marked completed (changed from false to true), send a notification
    if (completed === true && previousTask && !previousTask.completed) {
      // Phone notice (client app). Waits for it to go out: sending takes less than the email.
      const { data: allTasks } = await supabase.from('project_tasks').select('completed').eq('project_id', projectId)
      const total = allTasks?.length ?? 0
      const doneCount = allTasks?.filter((t) => t.completed).length ?? 0
      await notifyClient(serviceClient(), projectId, (project) => taskCompletedNotice({ project, task: task.title, done: doneCount, total, projectId }))
      // Send the notification email asynchronously (non-blocking)
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
        // The operation doesn't fail if the email fails
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
 * Deletes a task
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

    // Check the user is admin
    const role = roleOf(user)
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
