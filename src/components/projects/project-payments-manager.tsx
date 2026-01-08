'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Trash2, Edit2, DollarSign, Link2, Copy, Check, ExternalLink } from 'lucide-react'
import type { ProjectPayment, PaymentMethod, PaymentStatus } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

const paymentSchema = z.object({
  amount: z.string().min(1, 'El monto es requerido').refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0
  }, 'Debe ser un número válido mayor a 0'),
  currency: z.string().min(1, 'La moneda es requerida'),
  payment_method: z.string().min(1, 'El método de pago es requerido'),
  payment_date: z.string().min(1, 'La fecha es requerida'),
  notes: z.string().optional(),
  status: z.string().min(1, 'El estado es requerido'),
})

type PaymentFormValues = z.infer<typeof paymentSchema>

interface ProjectPaymentsManagerProps {
  projectId: string
  projectCurrency?: string
  projectTotalPrice?: number
  lang: 'es' | 'en'
}

const paymentMethods: Array<{ value: PaymentMethod; label_es: string; label_en: string }> = [
  { value: 'cash', label_es: 'Efectivo', label_en: 'Cash' },
  { value: 'transfer', label_es: 'Transferencia', label_en: 'Transfer' },
  { value: 'card', label_es: 'Tarjeta', label_en: 'Card' },
  { value: 'check', label_es: 'Cheque', label_en: 'Check' },
  { value: 'other', label_es: 'Otro', label_en: 'Other' },
]

const paymentStatuses: Array<{ value: PaymentStatus; label_es: string; label_en: string }> = [
  { value: 'pending', label_es: 'Pendiente', label_en: 'Pending' },
  { value: 'completed', label_es: 'Completado', label_en: 'Completed' },
  { value: 'cancelled', label_es: 'Cancelado', label_en: 'Cancelled' },
]

export function ProjectPaymentsManager({ projectId, projectCurrency = 'MXN', projectTotalPrice, lang }: ProjectPaymentsManagerProps) {
  const [payments, setPayments] = useState<ProjectPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<ProjectPayment | null>(null)
  const [stripePaymentLink, setStripePaymentLink] = useState<{ id: string; url: string } | null>(null)
  const [isLoadingStripeLink, setIsLoadingStripeLink] = useState(false)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [copied, setCopied] = useState(false)
  const [enableInstallments, setEnableInstallments] = useState(false)
  const [installmentOptions, setInstallmentOptions] = useState<number[]>([])

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: '',
      currency: projectCurrency,
      payment_method: '',
      payment_date: new Date().toISOString().split('T')[0],
      notes: '',
      status: 'pending',
    },
  })

  useEffect(() => {
    fetchPayments()
    fetchStripePaymentLink()
  }, [projectId])

  async function fetchStripePaymentLink() {
    try {
      const response = await fetch(`/api/projects/${projectId}/stripe-payment-link`)
      if (response.ok) {
        const data = await response.json()
        if (data.paymentLinkUrl) {
          setStripePaymentLink({ id: data.paymentLinkId, url: data.paymentLinkUrl })
          setEnableInstallments(data.enableInstallments || false)
          setInstallmentOptions(data.installmentOptions || [])
        }
      }
    } catch (error) {
      console.error('Error fetching Stripe payment link:', error)
    }
  }

  async function generateStripePaymentLink() {
    if (!projectTotalPrice || projectTotalPrice <= 0) {
      toast.error(lang === 'en' ? 'Project must have a total price' : 'El proyecto debe tener un precio total')
      return
    }

    setIsGeneratingLink(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/stripe-payment-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enableInstallments,
          installmentOptions: installmentOptions.length > 0 ? installmentOptions : [3, 6, 12],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create payment link')
      }

      const data = await response.json()
      setStripePaymentLink({ id: data.paymentLinkId, url: data.paymentLinkUrl })
      toast.success(lang === 'en' ? 'Payment link created successfully' : 'Enlace de pago creado exitosamente')
    } catch (error) {
      console.error('Error generating payment link:', error)
      toast.error(
        lang === 'en' 
          ? 'Error creating payment link' 
          : 'Error al crear enlace de pago',
        {
          description: error instanceof Error ? error.message : undefined,
        }
      )
    } finally {
      setIsGeneratingLink(false)
    }
  }

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
      toast.error(lang === 'en' ? 'Error loading payments' : 'Error al cargar pagos')
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(values: PaymentFormValues) {
    try {
      const supabase = createClient()
      const data = {
        project_id: projectId,
        amount: parseFloat(values.amount),
        currency: values.currency,
        payment_method: values.payment_method as PaymentMethod,
        payment_date: values.payment_date,
        notes: values.notes || null,
        status: values.status as PaymentStatus,
      }

      if (editingPayment) {
        const { error } = await supabase
          .from('project_payments')
          .update(data)
          .eq('id', editingPayment.id)

        if (error) throw error
        toast.success(lang === 'en' ? 'Payment updated successfully' : 'Pago actualizado exitosamente')
      } else {
        const { error } = await supabase
          .from('project_payments')
          .insert([data])

        if (error) throw error
        toast.success(lang === 'en' ? 'Payment added successfully' : 'Pago agregado exitosamente')
      }

      form.reset()
      setEditingPayment(null)
      setIsDialogOpen(false)
      fetchPayments()
    } catch (error) {
      console.error('Error saving payment:', error)
      toast.error(lang === 'en' ? 'Error saving payment' : 'Error al guardar pago')
    }
  }

  async function handleDelete(paymentId: string) {
    if (!confirm(lang === 'en' ? 'Are you sure you want to delete this payment?' : '¿Estás seguro de que quieres eliminar este pago?')) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('project_payments')
        .delete()
        .eq('id', paymentId)

      if (error) throw error
      toast.success(lang === 'en' ? 'Payment deleted successfully' : 'Pago eliminado exitosamente')
      fetchPayments()
    } catch (error) {
      console.error('Error deleting payment:', error)
      toast.error(lang === 'en' ? 'Error deleting payment' : 'Error al eliminar pago')
    }
  }

  function handleEdit(payment: ProjectPayment) {
    setEditingPayment(payment)
    form.reset({
      amount: payment.amount.toString(),
      currency: payment.currency || projectCurrency,
      payment_method: payment.payment_method || '',
      payment_date: payment.payment_date || new Date().toISOString().split('T')[0],
      notes: payment.notes || '',
      status: payment.status,
    })
    setIsDialogOpen(true)
  }

  function handleAddNew() {
    setEditingPayment(null)
    form.reset({
      amount: '',
      currency: projectCurrency,
      payment_method: '',
      payment_date: new Date().toISOString().split('T')[0],
      notes: '',
      status: 'pending',
    })
    setIsDialogOpen(true)
  }

  const completedPayments = payments.filter(p => p.status === 'completed')
  const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0)

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-MX', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(lang === 'en' ? 'Link copied to clipboard' : 'Enlace copiado al portapapeles')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Stripe Payment Link Section */}
      {projectTotalPrice && projectTotalPrice > 0 && (
        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                {lang === 'en' ? 'Stripe Payment Link' : 'Enlace de Pago Stripe'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {lang === 'en' 
                  ? 'Generate a payment link to share with your client'
                  : 'Genera un enlace de pago para compartir con tu cliente'
                }
              </p>
            </div>
          </div>

          {stripePaymentLink ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-background rounded-md border">
                <input
                  type="text"
                  value={stripePaymentLink.url}
                  readOnly
                  className="flex-1 text-sm bg-transparent border-none outline-none"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(stripePaymentLink.url)}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(stripePaymentLink.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const message = lang === 'en'
                      ? `Please complete your payment for the project: ${stripePaymentLink.url}`
                      : `Por favor completa el pago del proyecto: ${stripePaymentLink.url}`
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
                    window.open(whatsappUrl, '_blank')
                  }}
                >
                  {lang === 'en' ? 'Share via WhatsApp' : 'Compartir por WhatsApp'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const subject = lang === 'en' ? 'Project Payment Link' : 'Enlace de Pago del Proyecto'
                    const body = lang === 'en'
                      ? `Please complete your payment using this link: ${stripePaymentLink.url}`
                      : `Por favor completa el pago usando este enlace: ${stripePaymentLink.url}`
                    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                  }}
                >
                  {lang === 'en' ? 'Share via Email' : 'Compartir por Email'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  {lang === 'en' ? 'Enable installments (months without interest)' : 'Habilitar meses sin intereses'}
                </label>
                <Switch
                  checked={enableInstallments}
                  onCheckedChange={setEnableInstallments}
                />
              </div>
              {enableInstallments && (
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    {lang === 'en' ? 'Available options (comma separated):' : 'Opciones disponibles (separadas por comas):'}
                  </label>
                  <Input
                    type="text"
                    placeholder="3, 6, 12"
                    value={installmentOptions.join(', ')}
                    onChange={(e) => {
                      const values = e.target.value
                        .split(',')
                        .map(v => parseInt(v.trim()))
                        .filter(v => !isNaN(v) && v > 0)
                      setInstallmentOptions(values)
                    }}
                    className="!border-2 !border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    {lang === 'en' 
                      ? 'Note: Available options depend on the customer\'s bank and country'
                      : 'Nota: Las opciones disponibles dependen del banco y país del cliente'
                    }
                  </p>
                </div>
              )}
              <Button
                onClick={generateStripePaymentLink}
                disabled={isGeneratingLink}
                className="w-full"
              >
                {isGeneratingLink
                  ? (lang === 'en' ? 'Generating...' : 'Generando...')
                  : (lang === 'en' ? 'Generate Payment Link' : 'Generar Enlace de Pago')
                }
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Manual Payments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {lang === 'en' ? 'Manual Payments' : 'Pagos Manuales'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {lang === 'en' 
                ? `Total paid: ${formatCurrency(totalPaid, projectCurrency)}`
                : `Total pagado: ${formatCurrency(totalPaid, projectCurrency)}`
              }
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {lang === 'en' ? 'Add Payment' : 'Agregar Pago'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPayment 
                  ? (lang === 'en' ? 'Edit Payment' : 'Editar Pago')
                  : (lang === 'en' ? 'Add Payment' : 'Agregar Pago')
                }
              </DialogTitle>
              <DialogDescription>
                {lang === 'en'
                  ? 'Record a payment for this project'
                  : 'Registra un pago para este proyecto'
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{lang === 'en' ? 'Amount' : 'Monto'}</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01"
                            min="0"
                            className="!border-2 !border-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{lang === 'en' ? 'Currency' : 'Moneda'}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="!border-2 !border-border">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MXN">MXN</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="payment_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{lang === 'en' ? 'Payment Method' : 'Método de Pago'}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="!border-2 !border-border">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                {lang === 'es' ? method.label_es : method.label_en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="payment_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{lang === 'en' ? 'Payment Date' : 'Fecha de Pago'}</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" className="!border-2 !border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{lang === 'en' ? 'Status' : 'Estado'}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="!border-2 !border-border">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {lang === 'es' ? status.label_es : status.label_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{lang === 'en' ? 'Notes (optional)' : 'Notas (opcional)'}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} className="!border-2 !border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setEditingPayment(null)
                      form.reset()
                    }}
                  >
                    {lang === 'en' ? 'Cancel' : 'Cancelar'}
                  </Button>
                  <Button type="submit">
                    {editingPayment 
                      ? (lang === 'en' ? 'Update Payment' : 'Actualizar Pago')
                      : (lang === 'en' ? 'Add Payment' : 'Agregar Pago')
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">
          {lang === 'en' ? 'Loading payments...' : 'Cargando pagos...'}
        </p>
      ) : payments.length === 0 ? (
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
            const methodLabels = paymentMethods.find(m => m.value === payment.payment_method)
            const statusLabels = paymentStatuses.find(s => s.value === payment.status)

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
                      {lang === 'es' 
                        ? statusLabels?.label_es || payment.status
                        : statusLabels?.label_en || payment.status
                      }
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      {lang === 'en' ? 'Method' : 'Método'}: {lang === 'es' 
                        ? methodLabels?.label_es || payment.payment_method
                        : methodLabels?.label_en || payment.payment_method
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
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(payment)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(payment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      </div>
    </div>
  )
}

