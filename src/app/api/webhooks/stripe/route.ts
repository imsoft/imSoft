import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

if (!webhookSecret) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('STRIPE_WEBHOOK_SECRET is not set. Webhook verification will be disabled.')
  }
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

    // Verificar el webhook si tenemos el secret
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
      // En desarrollo, parsear sin verificación (NO usar en producción)
      event = JSON.parse(body) as Stripe.Event
      if (process.env.NODE_ENV === 'development') {
        console.warn('Webhook verification disabled. This should only happen in development.')
      }
    }

    const supabase = await createClient()

    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Obtener el project_id del metadata
        const projectId = session.metadata?.project_id

        if (!projectId) {
          console.warn('No project_id in session metadata')
          break
        }

        // Verificar si el pago ya fue registrado
        const { data: existingPayment } = await supabase
          .from('project_payments')
          .select('id')
          .eq('project_id', projectId)
          .eq('payment_method', 'stripe')
          .eq('status', 'completed')
          .single()

        if (existingPayment) {
          break
        }

        // Obtener información del pago
        const amount = session.amount_total ? session.amount_total / 100 : 0
        const currency = session.currency?.toUpperCase() || 'MXN'
        const paymentDate = new Date().toISOString().split('T')[0]

        // Crear registro de pago
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
        
        // Si el payment intent tiene metadata con project_id
        const projectId = paymentIntent.metadata?.project_id

        if (projectId) {
          // Verificar si el pago ya fue registrado
          const { data: existingPayment } = await supabase
            .from('project_payments')
            .select('id')
            .eq('project_id', projectId)
            .eq('payment_method', 'stripe')
            .eq('status', 'completed')
            .single()

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
        // Manejar eventos de pago fallido
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

        // Registrar el pago fallido si tenemos project_id
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

        // Log del error para debugging
        console.error('Payment failed event:', {
          type: event.type,
          projectId,
          amount,
          currency,
          errorMessage,
        })

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

// Stripe requiere GET para verificar el endpoint
export async function GET() {
  return NextResponse.json({ message: 'Stripe webhook endpoint' })
}

