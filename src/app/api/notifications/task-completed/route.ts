import { NextRequest, NextResponse } from 'next/server'
import { getResend } from '@/lib/email/resend-client';
import { taskCompletedEmail } from '@/lib/email/templates';
import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/quotes/server'


export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, taskId, taskTitle } = body

    if (!projectId || !taskId || !taskTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the project info
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        companies (
          name,
          user_id
        )
      `)
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Project owner (client). auth.users can't be queried through PostgREST: the admin API is used.
    const clientUserId = project.companies?.user_id
    const { data: authData, error: clientError } = clientUserId
      ? await serviceClient().auth.admin.getUserById(clientUserId)
      : { data: { user: null }, error: null }
    const clientUser = authData?.user

    if (clientError || !clientUser?.email) {
      console.error('Error fetching client user:', clientError)
      return NextResponse.json(
        { error: 'Client user not found' },
        { status: 404 }
      )
    }

    const clientEmail = clientUser.email
    const clientName = (clientUser.user_metadata?.full_name as string | undefined)?.split(' ')[0] || 'Cliente'

    // Get all the project's tasks to compute progress
    const { data: allTasks } = await supabase
      .from('project_tasks')
      .select('id, completed')
      .eq('project_id', projectId)

    const totalTasks = allTasks?.length || 0
    const completedTasks = allTasks?.filter(task => task.completed).length || 0

    // Send the email with Resend
    const { data: emailData, error: emailError } = await getResend().emails.send({
      from: `imSoft <${process.env.RESEND_FROM_EMAIL || 'contacto@imsoft.io'}>`,
      replyTo: process.env.ADMIN_NOTIFICATION_EMAIL || 'contacto@imsoft.io',
      to: [clientEmail],
      ...taskCompletedEmail({
        client: clientName,
        project: project.title_es || project.title_en,
        task: taskTitle,
        completed: completedTasks,
        total: totalTasks,
        link: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io'}/es/dashboard/client/projects/${projectId}`,
      }),
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send email', details: emailError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      emailId: emailData?.id,
      message: 'Email sent successfully'
    })

  } catch (error) {
    console.error('Error in task-completed notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
