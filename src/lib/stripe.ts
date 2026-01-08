import Stripe from 'stripe'

// Solo inicializar Stripe si la clave está disponible (en runtime, no en build time)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
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
  enableInstallments?: boolean
  installmentOptions?: number[]
}

export async function createPaymentLink({
  amount,
  currency,
  projectId,
  projectName,
  enableInstallments = false,
  installmentOptions = [],
}: CreatePaymentLinkParams): Promise<{ id: string; url: string }> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.')
  }
  
  try {
    // Convertir amount a centavos (Stripe usa la menor unidad de moneda)
    const amountInCents = Math.round(amount * 100)

    const paymentLinkData: Stripe.PaymentLinkCreateParams = {
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: projectName,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        project_id: projectId,
      },
    }

    // Si se habilitan cuotas y hay opciones, agregar configuración de installments
    if (enableInstallments && installmentOptions.length > 0) {
      // Stripe maneja installments automáticamente en algunos países
      // Para México, se puede configurar en el dashboard o usar payment_method_options
      paymentLinkData.payment_method_types = ['card']
      
      // Nota: La configuración de meses sin intereses puede variar por país
      // En México, Stripe detecta automáticamente las opciones disponibles del banco
      // Para forzar opciones específicas, se puede usar payment_method_options
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

