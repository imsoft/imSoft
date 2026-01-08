'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ProjectPayment } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { DollarSign } from 'lucide-react'

interface ProjectPaymentsViewerProps {
  projectId: string
  projectCurrency?: string
  projectTotalPrice?: number
  lang: 'es' | 'en'
}

export function ProjectPaymentsViewer({ 
  projectId, 
  projectCurrency = 'MXN', 
  projectTotalPrice,
  lang 
}: ProjectPaymentsViewerProps) {
  const [payments, setPayments] = useState<ProjectPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [projectId])

  async function fetchPayments() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_payments')
        .select('*')
        .eq('project_id', projectId)
        .order('payment_date', { ascending: false })

      if (error) throw error
      setPayments(data || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const completedPayments = payments.filter(p => p.status === 'completed')
  const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = projectTotalPrice ? projectTotalPrice - totalPaid : 0
  const paymentPercentage = projectTotalPrice ? (totalPaid / projectTotalPrice) * 100 : 0

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-MX', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        {lang === 'en' ? 'Loading payments...' : 'Cargando pagos...'}
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      {projectTotalPrice !== undefined && projectTotalPrice !== null && (
        <div className="space-y-2 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {lang === 'en' ? 'Total Price' : 'Precio Total'}
            </span>
            <span className="text-sm font-semibold">
              {formatCurrency(projectTotalPrice, projectCurrency)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {lang === 'en' ? 'Total Paid' : 'Total Pagado'}
            </span>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(totalPaid, projectCurrency)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {lang === 'en' ? 'Remaining' : 'Pendiente'}
            </span>
            <span className={`text-sm font-semibold ${remaining > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
              {formatCurrency(remaining, projectCurrency)}
            </span>
          </div>
          {projectTotalPrice > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  {lang === 'en' ? 'Payment Progress' : 'Progreso de Pago'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {paymentPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>{lang === 'en' ? 'No payments recorded yet' : 'Aún no hay pagos registrados'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((payment) => {
            const statusColors = {
              pending: 'bg-yellow-500',
              completed: 'bg-green-500',
              cancelled: 'bg-red-500',
            }
            const statusLabels = {
              pending: lang === 'en' ? 'Pending' : 'Pendiente',
              completed: lang === 'en' ? 'Completed' : 'Completado',
              cancelled: lang === 'en' ? 'Cancelled' : 'Cancelado',
            }
            const methodLabels: Record<string, { es: string; en: string }> = {
              cash: { es: 'Efectivo', en: 'Cash' },
              transfer: { es: 'Transferencia', en: 'Transfer' },
              card: { es: 'Tarjeta', en: 'Card' },
              check: { es: 'Cheque', en: 'Check' },
              other: { es: 'Otro', en: 'Other' },
            }

            return (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-900"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">
                      {formatCurrency(payment.amount, payment.currency || projectCurrency)}
                    </span>
                    <Badge
                      variant="outline"
                      className={`${statusColors[payment.status] || 'bg-gray-500'} text-white border-0`}
                    >
                      {statusLabels[payment.status]}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      {lang === 'en' ? 'Method' : 'Método'}: {lang === 'es' 
                        ? methodLabels[payment.payment_method || '']?.es || payment.payment_method
                        : methodLabels[payment.payment_method || '']?.en || payment.payment_method
                      }
                    </div>
                    {payment.payment_date && (
                      <div>
                        {lang === 'en' ? 'Date' : 'Fecha'}: {new Date(payment.payment_date).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX')}
                      </div>
                    )}
                    {payment.notes && (
                      <div className="text-xs">{payment.notes}</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

