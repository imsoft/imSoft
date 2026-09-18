import { NextRequest, NextResponse } from 'next/server'
import { getResend } from '@/lib/email/resend-client';
import { correoTareaCompletada } from '@/lib/email/plantillas';
import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/quotes/server'


export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
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

    // Obtener información del proyecto
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

    // Dueño del proyecto (cliente). auth.users no se consulta por PostgREST: se usa la API de admin.
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

    // Obtener todas las tareas del proyecto para calcular progreso
    const { data: allTasks } = await supabase
      .from('project_tasks')
      .select('id, completed')
      .eq('project_id', projectId)

    const totalTasks = allTasks?.length || 0
    const completedTasks = allTasks?.filter(task => task.completed).length || 0

    // Enviar email con Resend
    const { data: emailData, error: emailError } = await getResend().emails.send({
      from: `imSoft <${process.env.RESEND_FROM_EMAIL || 'contacto@imsoft.io'}>`,
      replyTo: process.env.ADMIN_NOTIFICATION_EMAIL || 'contacto@imsoft.io',
      to: [clientEmail],
      ...correoTareaCompletada({
        cliente: clientName,
        proyecto: project.title_es || project.title_en,
        tarea: taskTitle,
        completadas: completedTasks,
        total: totalTasks,
        enlace: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io'}/es/dashboard/client/projects/${projectId}`,
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
