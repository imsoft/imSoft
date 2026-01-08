import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPaymentLink } from '@/lib/stripe'

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
    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Obtener el proyecto
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (!project.total_price || project.total_price <= 0) {
      return NextResponse.json(
        { error: 'Project must have a total price to create payment link' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { enableInstallments = false, installmentOptions = [] } = body

    // Obtener el nombre del proyecto
    const projectName = project.title_en || project.title_es || project.title || 'Project Payment'

    // Crear el payment link en Stripe
    const { id: paymentLinkId, url: paymentLinkUrl } = await createPaymentLink({
      amount: project.total_price,
      currency: project.currency || 'MXN',
      projectId: project.id,
      projectName,
      enableInstallments,
      installmentOptions,
    })

    // Actualizar el proyecto con la información del payment link
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        stripe_payment_link_id: paymentLinkId,
        stripe_payment_link_url: paymentLinkUrl,
        stripe_enable_installments: enableInstallments,
        stripe_installment_options: installmentOptions.length > 0 
          ? JSON.stringify(installmentOptions) 
          : null,
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating project with payment link:', updateError)
      return NextResponse.json(
        { error: 'Failed to save payment link' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      paymentLinkId,
      paymentLinkUrl,
    })
  } catch (error) {
    console.error('Error creating payment link:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Obtener el proyecto
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('stripe_payment_link_id, stripe_payment_link_url, stripe_enable_installments, stripe_installment_options')
      .eq('id', id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({
      paymentLinkId: project.stripe_payment_link_id,
      paymentLinkUrl: project.stripe_payment_link_url,
      enableInstallments: project.stripe_enable_installments,
      installmentOptions: project.stripe_installment_options 
        ? JSON.parse(project.stripe_installment_options) 
        : [],
    })
  } catch (error) {
    console.error('Error retrieving payment link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

