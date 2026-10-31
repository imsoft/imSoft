import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPaymentLink } from '@/lib/stripe'
import { linkNotes, validateLinkAmount } from '@/lib/payment-links'
import { roleOf } from '@/lib/roles'

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

    // Admins only
    const userRole = roleOf(user)
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Load the project
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

    // The amount can't exceed what's left to collect (completed + already linked).
    const { data: projectPayments } = await supabase
      .from('project_payments')
      .select('amount, status')
      .eq('project_id', id)
    const invalid = validateLinkAmount(amount, Number(project.total_price), projectPayments ?? [])
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 })
    }

    const projectName = project.title_en || project.title_es || project.title || 'Project Payment'
    const currency = project.currency || 'MXN'

    // 1) Pending row: what the webhook will mark as completed.
    const { data: pendingPayment, error: pendingError } = await supabase
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
    if (pendingError || !pendingPayment) {
      console.error('Error creating pending payment:', pendingError)
      return NextResponse.json({ error: 'Failed to create pending payment' }, { status: 500 })
    }

    // 2) Stripe link tied to that row.
    let paymentLinkId: string
    let paymentLinkUrl: string
    try {
      ;({ id: paymentLinkId, url: paymentLinkUrl } = await createPaymentLink({
        amount,
        currency,
        projectId: project.id,
        projectName,
        paymentId: pendingPayment.id,
        label,
        enableInstallments,
        installmentOptions,
      }))
    } catch (err) {
      await supabase.from('project_payments').delete().eq('id', pendingPayment.id)
      throw err
    }

    // 3) The URL goes into the pending payment's notes (copied from the list) and the
    //    project keeps the latest link, as before.
    await supabase
      .from('project_payments')
      .update({ notes: linkNotes(label, paymentLinkUrl) })
      .eq('id', pendingPayment.id)

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
      paymentId: pendingPayment.id,
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

    // Load the project
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

