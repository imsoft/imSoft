import Stripe from 'stripe'

// Only initialize Stripe when the key is available (at runtime, not at build time)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-06-24.dahlia',
      typescript: true,
    })
  : null

if (!stripe && typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.')
}

export interface CreatePaymentLinkParams {
  amount: number
  currency: string
  projectId: string
  projectName: string
  /** project_payments row (status pending) this link settles. */
  paymentId?: string
  /** "Anticipo (50%)", "Liquidación"... shown on the payment screen. */
  label?: string
  enableInstallments?: boolean
  installmentOptions?: number[]
}

export async function createPaymentLink({
  amount,
  currency,
  projectId,
  projectName,
  paymentId,
  label,
  enableInstallments = false,
  installmentOptions = [],
}: CreatePaymentLinkParams): Promise<{ id: string; url: string }> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.')
  }
  
  try {
    // Amount in cents (Stripe uses the smallest currency unit)
    const amountInCents = Math.round(amount * 100)
    const metadata: Record<string, string> = { project_id: projectId }
    if (paymentId) metadata.payment_id = paymentId

    const paymentLinkData: Stripe.PaymentLinkCreateParams = {
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: label ? `${projectName} · ${label}` : projectName,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      // On the Checkout session and on the PaymentIntent too: the webhook gets both events
      // and with payment_id marks the same row, without duplicating the payment.
      metadata,
      payment_intent_data: { metadata },
      // A milestone is charged once: the link deactivates after the first payment.
      restrictions: { completed_sessions: { limit: 1 } },
    }

    // Interest-free installments: for Payment Links the plans and minimums are governed by
    // the payment methods settings in the Stripe Dashboard (enabled 2026-09-13), not by
    // this parameter. Here the link is only limited to cards so the payment screen shows
    // the terms when a Mexican card is entered.
    if (enableInstallments && installmentOptions.length > 0) {
      paymentLinkData.payment_method_types = ['card']
    }

    const paymentLink = await stripe.paymentLinks.create(paymentLinkData)

    return {
      id: paymentLink.id,
      url: paymentLink.url,
    }
  } catch (error) {
    console.error('Error creating Stripe payment link:', error)
    throw error
  }
}

export async function updatePaymentLink(
  paymentLinkId: string,
  params: {
    active?: boolean
    metadata?: Record<string, string>
  }
): Promise<Stripe.PaymentLink> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.')
  }
  
  try {
    const paymentLink = await stripe.paymentLinks.update(paymentLinkId, params)
    return paymentLink
  } catch (error) {
    console.error('Error updating Stripe payment link:', error)
    throw error
  }
}

export async function retrievePaymentLink(paymentLinkId: string): Promise<Stripe.PaymentLink> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.')
  }
  
  try {
    const paymentLink = await stripe.paymentLinks.retrieve(paymentLinkId)
    return paymentLink
  } catch (error) {
    console.error('Error retrieving Stripe payment link:', error)
    throw error
  }
}

