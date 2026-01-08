import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Obtener información del usuario dueño del proyecto (cliente)
    const { data: clientUser, error: clientError } = await supabase
      .from('auth.users')
      .select('email, raw_user_meta_data')
      .eq('id', project.companies?.user_id)
      .single()

    if (clientError || !clientUser) {
      console.error('Error fetching client user:', clientError)
      return NextResponse.json(
        { error: 'Client user not found' },
        { status: 404 }
      )
    }

    const clientEmail = clientUser.email
    const clientName = clientUser.raw_user_meta_data?.full_name || 'Cliente'

    // Obtener todas las tareas del proyecto para calcular progreso
    const { data: allTasks } = await supabase
      .from('project_tasks')
      .select('id, completed')
      .eq('project_id', projectId)

    const totalTasks = allTasks?.length || 0
    const completedTasks = allTasks?.filter(task => task.completed).length || 0
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Enviar email con Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'imSoft <noreply@imsoft.io>',
      to: [clientEmail],
      subject: `Actualización de tu proyecto: ${project.title_es || project.title_en}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Actualización de Proyecto</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">imSoft</h1>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">¡Hola ${clientName}!</h2>

                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                          Hemos completado una nueva tarea en tu proyecto <strong>${project.title_es || project.title_en}</strong>.
                        </p>

                        <!-- Task Completed -->
                        <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
                          <p style="margin: 0; color: #15803d; font-size: 14px; font-weight: 600;">✓ Tarea Completada</p>
                          <p style="margin: 8px 0 0 0; color: #166534; font-size: 16px; font-weight: 500;">${taskTitle}</p>
                        </div>

                        <!-- Progress Bar -->
                        <div style="margin-bottom: 24px;">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 500;">Progreso del Proyecto</p>
                            <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 700;">${progressPercentage}%</p>
                          </div>
                          <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 9999px; overflow: hidden;">
                            <div style="width: ${progressPercentage}%; height: 100%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); transition: width 0.3s ease;"></div>
                          </div>
                          <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 12px;">${completedTasks} de ${totalTasks} tareas completadas</p>
                        </div>

                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                          <tr>
                            <td align="center">
                              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/es/dashboard/client/projects/${projectId}"
                                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                Ver Proyecto Completo
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          Puedes acceder a tu dashboard en cualquier momento para ver todas las actualizaciones de tu proyecto.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                          © ${new Date().getFullYear()} imSoft. Todos los derechos reservados.
                        </p>
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                          Este es un correo automático, por favor no respondas a este mensaje.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
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
