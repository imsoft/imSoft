'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { QuotationOption } from '@/types/database'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface QuestionsManagerProps {
  services: any[]
  questions: any[]
  dict: Dictionary
  lang: Locale
}

interface SortableQuestionProps {
  question: any
  index: number
  lang: Locale
  onDelete: (id: string) => void
  formatCurrency: (amount: number) => string
  getQuestionTypeLabel: (type: string) => string
}

function SortableQuestion({ question, index, lang, onDelete, formatCurrency, getQuestionTypeLabel }: SortableQuestionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const questionText = lang === 'es' ? question.question_es : question.question_en

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {index + 1}
              </span>
              <h4 className="font-medium">{questionText}</h4>
              <Badge variant="outline">{getQuestionTypeLabel(question.question_type)}</Badge>
              {question.is_required && (
                <Badge variant="destructive" className="text-xs">
                  {lang === 'en' ? 'Required' : 'Requerida'}
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              {question.question_type === 'multiple_choice' && question.options && (
                <div>
                  <span className="font-medium">{lang === 'en' ? 'Options:' : 'Opciones:'}</span>
                  <ul className="list-disc list-inside ml-2">
                    {question.options.map((opt: QuotationOption, i: number) => (
                      <li key={i}>
                        {lang === 'es' ? opt.label_es : opt.label_en} ({formatCurrency(opt.price)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {question.question_type === 'yes_no' && question.base_price > 0 && (
                <p>
                  {lang === 'en' ? 'Price if Yes:' : 'Precio si Sí:'} {formatCurrency(question.base_price)}
                </p>
              )}
              {(question.question_type === 'number' || question.question_type === 'range') && (
                <p>
                  {formatCurrency(question.base_price)} + ({formatCurrency(question.price_multiplier)} × cantidad)
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              asChild
            >
              <Link href={`/${lang}/dashboard/admin/quotations/questions/${question.id}/edit`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(question.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function QuestionsManager({ services, questions: initialQuestions, dict, lang }: QuestionsManagerProps) {
  const router = useRouter()
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [questions, setQuestions] = useState<any[]>(initialQuestions)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Filtrar preguntas por servicio seleccionado
  useEffect(() => {
    if (selectedServiceId) {
      const filtered = initialQuestions.filter(q => q.service_id === selectedServiceId)
      setQuestions(filtered.sort((a, b) => a.order_index - b.order_index))
    } else {
      setQuestions([])
    }
  }, [selectedServiceId, initialQuestions])

  async function handleDeleteQuestion(id: string) {
    if (!confirm(lang === 'en' ? 'Are you sure you want to delete this question?' : '¿Estás seguro de que quieres eliminar esta pregunta?')) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('quotation_questions')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success(lang === 'en' ? 'Question deleted successfully' : 'Pregunta eliminada exitosamente')
      router.refresh()
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error(lang === 'en' ? 'Error deleting question' : 'Error al eliminar pregunta')
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = questions.findIndex(q => q.id === active.id)
    const newIndex = questions.findIndex(q => q.id === over.id)

    const newQuestions = arrayMove(questions, oldIndex, newIndex)
    setQuestions(newQuestions)

    // Update order_index in backend
    try {
      const supabase = createClient()
      await Promise.all(
        newQuestions.map((question, index) =>
          supabase
            .from('quotation_questions')
            .update({ order_index: index })
            .eq('id', question.id)
        )
      )

      toast.success(lang === 'en' ? 'Question order updated' : 'Orden de pregunta actualizado')
      router.refresh()
    } catch (error) {
      console.error('Error updating question order:', error)
      toast.error(lang === 'en' ? 'Error updating question order' : 'Error al actualizar el orden de preguntas')
      router.refresh() // Reload to get correct order
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, { es: string; en: string }> = {
      multiple_choice: { es: 'Opción Múltiple', en: 'Multiple Choice' },
      yes_no: { es: 'Sí/No', en: 'Yes/No' },
      number: { es: 'Número', en: 'Number' },
      range: { es: 'Rango', en: 'Range' },
    }
    return lang === 'es' ? labels[type]?.es : labels[type]?.en
  }

  return (
    <div className="space-y-6">
      {/* Selector de Servicio */}
      <Card>
        <CardHeader>
          <CardTitle>{lang === 'en' ? 'Select Service' : 'Seleccionar Servicio'}</CardTitle>
          <CardDescription>
            {lang === 'en'
              ? 'Choose a service to manage its questions'
              : 'Elige un servicio para gestionar sus preguntas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
            <SelectTrigger className="w-full !border-2 !border-border">
              <SelectValue placeholder={lang === 'en' ? 'Select a service...' : 'Selecciona un servicio...'} />
            </SelectTrigger>
            <SelectContent>
              {services.map(service => (
                <SelectItem key={service.id} value={service.id}>
                  {lang === 'es' ? service.title_es : service.title_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Lista de Preguntas */}
      {selectedServiceId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {lang === 'en' ? 'Questions' : 'Preguntas'}
                </CardTitle>
                <CardDescription>
                  {lang === 'en'
                    ? `Manage questions for this service (${questions.length} total)`
                    : `Gestiona las preguntas para este servicio (${questions.length} en total)`}
                </CardDescription>
              </div>
              <Button asChild>
                <Link href={`/${lang}/dashboard/admin/quotations/questions/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  {lang === 'en' ? 'Add Question' : 'Agregar Pregunta'}
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {lang === 'en'
                  ? 'No questions yet. Add your first question to get started.'
                  : 'Aún no hay preguntas. Agrega tu primera pregunta para comenzar.'}
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={questions.map(q => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <SortableQuestion
                        key={question.id}
                        question={question}
                        index={index}
                        lang={lang}
                        onDelete={handleDeleteQuestion}
                        formatCurrency={formatCurrency}
                        getQuestionTypeLabel={getQuestionTypeLabel}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
