import { NextRequest, NextResponse } from 'next/server'
import { notifyClient, paymentNotice } from '@/lib/mobile-app/notifications'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { ADMIN_EMAIL, sendEmail, serviceClient } from '@/lib/quotes/server'
import { stripe } from '@/lib/stripe'
import { monthlyFeesCharged, planChargeLabel, planMonths, planPaidOff, subscriptionFromInvoice } from '@/lib/monthly-plan'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

if (!webhookSecret) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('STRIPE_WEBHOOK_SECRET is not set. Webhook verification will be disabled.')
  }
}


/**
 * Milestone links: the link carries payment_id and the webhook marks that row as
 * completed. Returns true if it handled it (or it was already completed); false if the
 * event comes from an old link without payment_id and the previous path must be followed.
 */
async function completePendingPayment(
  supabase: ReturnType<typeof serviceClient>,
  paymentId: string | undefined,
  reference: string,
): Promise<boolean> {
  if (!paymentId) return false
  const { data: row } = await supabase
    .from('project_payments')
    .select('id, status, notes')
    .eq('id', paymentId)
    .maybeSingle()
  if (!row) return false
  if (row.status === 'completed') return true
  const { error } = await supabase
    .from('project_payments')
    .update({
      status: 'completed',
      payment_date: new Date().toISOString().split('T')[0],
      notes: `${row.notes ?? ''} · ${reference}`.trim(),
    })
    .eq('id', paymentId)
  if (error) console.error('[Stripe Webhook] Error completing pending payment:', error)
  if (!error) {
    const { data: payment } = await supabase.from('project_payments').select('project_id, amount, currency').eq('id', paymentId).maybeSingle()
    if (payment) await notifyClient(supabase, payment.project_id, (project) => paymentNotice({ project, amount: Number(payment.amount), currency: payment.currency, status: 'completed', projectId: payment.project_id }))
  }
  return !error
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    let event: Stripe.Event

    // Verify the webhook when the secret is set
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        )
      }
    } else {
      // In development, parse without verification (NEVER in production)
      event = JSON.parse(body) as Stripe.Event
      if (process.env.NODE_ENV === 'development') {
        console.warn('Webhook verification disabled. This should only happen in development.')
      }
    }

    // Service key: the webhook has no user session and, with the database rules, it
    // couldn't record or complete payments without it.
    const supabase = serviceClient()

    // Idempotency: check whether the event was already processed
    const { error: idempotencyError } = await supabase
      .from('processed_stripe_events')
      .insert({ id: event.id })

    if (idempotencyError) {
      // 23505 = duplicate key (already processed)
      if (idempotencyError.code === '23505') {
        console.log(`[Stripe Webhook] Duplicate event skipped: ${event.id}`)
        return NextResponse.json({ received: true, duplicate: true })
      }
      // Unless it's 42P01 (table missing), log it
      if (idempotencyError.code !== '42P01') {
        console.error('[Stripe Webhook] Error recording idempotency:', idempotencyError)
      }
    }

    // Handle each event type
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        // The monthly plan is recorded per invoice (invoice.paid): deposit and each monthly fee.
        if (session.mode === 'subscription') break
        
        // project_id from the metadata
        const projectId = session.metadata?.project_id

        if (!projectId) {
          console.warn('No project_id in session metadata')
          break
        }

        if (await completePendingPayment(supabase, session.metadata?.payment_id, `Stripe Session ${session.id}`)) {
          break
        }

        // Old links (without payment_id): recorded as before, only once.
        const { data: existingPayment } = await supabase
          .from('project_payments')
          .select('id')
          .eq('project_id', projectId)
          .eq('payment_method', 'card')
          .eq('status', 'completed')
          .ilike('notes', `%${session.id}%`)
          .maybeSingle()

        if (existingPayment) {
          break
        }

        // Payment details
        const amount = session.amount_total ? session.amount_total / 100 : 0
        const currency = session.currency?.toUpperCase() || 'MXN'
        const paymentDate = new Date().toISOString().split('T')[0]

        // Create the payment record
        const { error: paymentError } = await supabase
          .from('project_payments')
          .insert({
            project_id: projectId,
            amount: amount,
            currency: currency,
            payment_method: 'card',
            payment_date: paymentDate,
            status: 'completed',
            notes: `Stripe Payment - Session ID: ${session.id}`,
          })

        if (!paymentError) {
          await notifyClient(supabase, projectId, (project) => paymentNotice({ project, amount, currency, status: 'completed', projectId }))
        }
        if (paymentError) {
          console.error('Error creating payment record:', paymentError)
          return NextResponse.json(
            { error: 'Failed to create payment record' },
            { status: 500 }
          )
        }

        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // When the payment intent has a project_id in its metadata
        const projectId = paymentIntent.metadata?.project_id

        if (projectId) {
          if (await completePendingPayment(supabase, paymentIntent.metadata?.payment_id, `Stripe PaymentIntent ${paymentIntent.id}`)) {
            break
          }
          // Old links: checkout.session.completed already recorded this same charge, so
          // here it's only inserted when there's no completed card payment.
          const { data: existingPayment } = await supabase
            .from('project_payments')
            .select('id')
            .eq('project_id', projectId)
            .eq('payment_method', 'card')
            .eq('status', 'completed')
            .limit(1)
            .maybeSingle()

          if (!existingPayment) {
            const amount = paymentIntent.amount ? paymentIntent.amount / 100 : 0
            const currency = paymentIntent.currency?.toUpperCase() || 'MXN'
            const paymentDate = new Date().toISOString().split('T')[0]

            await supabase
              .from('project_payments')
              .insert({
                project_id: projectId,
                amount: amount,
                currency: currency,
                payment_method: 'card',
                payment_date: paymentDate,
                status: 'completed',
                notes: `Stripe Payment - Payment Intent ID: ${paymentIntent.id}`,
              })
          }
        }
        break
      }

      case 'checkout.session.async_payment_failed':
      case 'payment_intent.payment_failed':
      case 'charge.failed': {
        // Failed payment events
        let projectId: string | undefined
        let paymentId: string | undefined
        let amount = 0
        let currency = 'MXN'
        let errorMessage = 'Payment failed'

        if (event.type === 'checkout.session.async_payment_failed') {
          const session = event.data.object as Stripe.Checkout.Session
          projectId = session.metadata?.project_id
          amount = session.amount_total ? session.amount_total / 100 : 0
          currency = session.currency?.toUpperCase() || 'MXN'
          errorMessage = `Checkout session failed - Session ID: ${session.id}`
        } else if (event.type === 'payment_intent.payment_failed') {
          const paymentIntent = event.data.object as Stripe.PaymentIntent
          projectId = paymentIntent.metadata?.project_id
          amount = paymentIntent.amount ? paymentIntent.amount / 100 : 0
          currency = paymentIntent.currency?.toUpperCase() || 'MXN'
          errorMessage = `Payment intent failed - Payment Intent ID: ${paymentIntent.id}`
          if (paymentIntent.last_payment_error) {
            errorMessage += ` - ${paymentIntent.last_payment_error.message || 'Unknown error'}`
          }
        } else if (event.type === 'charge.failed') {
          const charge = event.data.object as Stripe.Charge
          projectId = charge.metadata?.project_id
          amount = charge.amount ? charge.amount / 100 : 0
          currency = charge.currency?.toUpperCase() || 'MXN'
          errorMessage = `Charge failed - Charge ID: ${charge.id}`
          if (charge.failure_message) {
            errorMessage += ` - ${charge.failure_message}`
          }
        }

        // Record the failed payment when there's a project_id
        if (projectId) {
          const paymentDate = new Date().toISOString().split('T')[0]

          await supabase
            .from('project_payments')
            .insert({
              project_id: projectId,
              amount: amount,
              currency: currency,
              payment_method: 'card',
              payment_date: paymentDate,
              status: 'cancelled',
              notes: errorMessage,
            })
        }

        // Log the error for debugging
        console.error('Payment failed event:', {
          type: event.type,
          projectId,
          amount,
          currency,
          errorMessage,
        })

        break
      }

      case 'invoice.paid': {
        // Monthly plan: the first invoice is the deposit (the monthly fee starts after the
        // grace period) and each later one is a monthly fee.
        const invoice = event.data.object as Stripe.Invoice
        const { subscriptionId, metadata, billingReason } = subscriptionFromInvoice(invoice)
        const projectId = metadata.project_id
        if (!subscriptionId || metadata.plan !== '1' || !projectId) break
        // Reads `months`, or `meses` on subscriptions created before the English rename.
        const months = planMonths(metadata)
        const amount = (invoice.amount_paid ?? 0) / 100
        if (amount <= 0) break
        const { data: previous } = await supabase.from('project_payments').select('notes').eq('project_id', projectId)
        const charged = monthlyFeesCharged((previous ?? []).map((p) => p.notes))
        const isDeposit = billingReason === 'subscription_create'
        const notes = planChargeLabel({ isDeposit, number: charged + 1, months, invoiceId: invoice.id ?? '' })
        if ((previous ?? []).some((p) => (p.notes ?? '').includes(`Stripe Invoice ${invoice.id}`))) break
        const { error: e } = await supabase.from('project_payments').insert({ project_id: projectId, amount, currency: (invoice.currency ?? 'mxn').toUpperCase(), payment_method: 'card', payment_date: new Date().toISOString().split('T')[0], status: 'completed', notes })
        if (e) { console.error('[Stripe Webhook] plan: charge not recorded', e); break }
        await notifyClient(supabase, projectId, (project) => paymentNotice({ project, amount: amount, currency: (invoice.currency ?? 'mxn').toUpperCase(), status: 'completed', projectId }))
        // With the last monthly fee, the subscription ends by itself.
        if (!isDeposit && months > 0 && planPaidOff(charged + 1, months)) {
          await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true }).catch((err) => console.error('[Stripe Webhook] plan: could not close the subscription', err))
          await sendEmail({ to: ADMIN_EMAIL, subject: `Plan liquidado · proyecto ${projectId}`, html: `<p>Se cobró la última mensualidad (${charged + 1} de ${months}) del plan. Toca transferir el código al cliente y ofrecerle la mensualidad de hosting y soporte.</p>` }).catch(() => {})
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const { subscriptionId, metadata } = subscriptionFromInvoice(invoice)
        const projectId = metadata.project_id
        if (!subscriptionId || metadata.plan !== '1' || !projectId) break
        const amount = (invoice.amount_due ?? 0) / 100
        await supabase.from('project_payments').insert({ project_id: projectId, amount, currency: (invoice.currency ?? 'mxn').toUpperCase(), payment_method: 'card', payment_date: new Date().toISOString().split('T')[0], status: 'cancelled', notes: `Plan mensual · Cobro rechazado · Stripe Invoice ${invoice.id}` })
        // Stripe retries by itself; this warns so access can be suspended if it isn't settled (clause Two).
        await sendEmail({ to: ADMIN_EMAIL, subject: `Mensualidad rechazada · proyecto ${projectId}`, html: `<p>Stripe no pudo cobrar la mensualidad de ${amount} ${(invoice.currency ?? 'mxn').toUpperCase()} del plan (suscripción ${subscriptionId}). Stripe reintentará; si pasan 10 días sin pago, el contrato permite suspender el acceso.</p>` }).catch(() => {})
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        if (sub.metadata?.plan !== '1' || !sub.metadata?.project_id) break
        await sendEmail({ to: ADMIN_EMAIL, subject: `Suscripción del plan terminada · proyecto ${sub.metadata.project_id}`, html: `<p>La suscripción ${sub.id} del plan mensual terminó (${sub.cancellation_details?.reason ?? 'sin motivo registrado'}). Revisa si fue por liquidación o por impago.</p>` }).catch(() => {})
        break
      }

      default:
        // Unhandled event type - silently ignore
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Stripe needs GET to verify the endpoint
export async function GET() {
  return NextResponse.json({ message: 'Stripe webhook endpoint' })
}

