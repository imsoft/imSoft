import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPaymentLink } from '@/lib/stripe'
import { notasEnlace, validarMontoEnlace } from '@/lib/payment-links'

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
    const amount = Number(body.amount ?? project.total_price)
    const label: string = String(body.label ?? '').trim() || 'Pago'

    // El monto no puede pasar de lo que falta por cobrar (completado + ya enlazado).
    const { data: pagosProyecto } = await supabase
      .from('project_payments')
      .select('amount, status')
      .eq('project_id', id)
    const invalido = validarMontoEnlace(amount, Number(project.total_price), pagosProyecto ?? [])
    if (invalido) {
      return NextResponse.json({ error: invalido }, { status: 400 })
    }

    const projectName = project.title_en || project.title_es || project.title || 'Project Payment'
    const currency = project.currency || 'MXN'

    // 1) Fila pendiente: es lo que el webhook marcara como completado.
    const { data: pago, error: pagoError } = await supabase
      .from('project_payments')
      .insert({
        project_id: id,
        amount,
        currency,
        payment_method: 'card',
        payment_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        notes: label,
      })
      .select('id')
      .single()
    if (pagoError || !pago) {
      console.error('Error creating pending payment:', pagoError)
      return NextResponse.json({ error: 'Failed to create pending payment' }, { status: 500 })
    }

    // 2) Enlace de Stripe atado a esa fila.
    let paymentLinkId: string
    let paymentLinkUrl: string
    try {
      ;({ id: paymentLinkId, url: paymentLinkUrl } = await createPaymentLink({
        amount,
        currency,
        projectId: project.id,
        projectName,
        paymentId: pago.id,
        label,
        enableInstallments,
        installmentOptions,
      }))
    } catch (err) {
      await supabase.from('project_payments').delete().eq('id', pago.id)
      throw err
    }

    // 3) La URL queda en las notas del pago pendiente (se copia desde la lista) y el
    //    proyecto guarda el ultimo enlace, como antes.
    await supabase
      .from('project_payments')
      .update({ notes: notasEnlace(label, paymentLinkUrl) })
      .eq('id', pago.id)

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
    if (updateError) console.error('Error updating project with payment link:', updateError)

    return NextResponse.json({
      paymentLinkId,
      paymentLinkUrl,
      paymentId: pago.id,
      amount,
      label,
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

