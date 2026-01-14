'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Card } from '@/components/ui/card'
import { DealCard } from './deal-card'
import type { Deal, DealStage } from '@/types/database'
import { useRouter } from 'next/navigation'

interface KanbanBoardProps {
  deals: (Deal & {
    contacts?: {
      first_name: string
      last_name: string
      email: string
      phone?: string
      company?: string
    }
    email_sent?: boolean
  })[]
  lang: string
}

const STAGES: { id: DealStage; label_en: string; label_es: string; color: string }[] = [
  { id: 'no_contact', label_en: 'No Contact', label_es: 'Sin Contacto', color: 'bg-gray-500' },
  { id: 'qualification', label_en: 'Prospecting', label_es: 'Prospección', color: 'bg-blue-500' },
  { id: 'proposal', label_en: 'Proposal', label_es: 'Propuesta', color: 'bg-purple-500' },
  { id: 'negotiation', label_en: 'Negotiation', label_es: 'Negociación', color: 'bg-orange-500' },
  { id: 'closed_won', label_en: 'Won', label_es: 'Ganado', color: 'bg-green-500' },
  { id: 'closed_lost', label_en: 'Lost', label_es: 'Perdido', color: 'bg-red-500' },
]

// Componente para la columna droppable
function DroppableColumn({
  id,
  children,
  hasDeals
}: {
  id: string
  children: React.ReactNode
  hasDeals: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 min-h-[200px] p-2 rounded-lg border-2 border-dashed transition-colors ${
        isOver
          ? 'border-primary bg-primary/5'
          : hasDeals
          ? 'border-muted-foreground/20'
          : 'border-transparent'
      }`}
    >
      {children}
    </div>
  )
}

export function KanbanBoard({ deals: initialDeals, lang }: KanbanBoardProps) {
  const router = useRouter()
  const [deals, setDeals] = useState(initialDeals)
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)
  const [originalStage, setOriginalStage] = useState<DealStage | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Agrupar deals por stage
  const dealsByStage = useMemo(() => {
    const grouped: Record<DealStage, typeof deals> = {
      no_contact: [],
      qualification: [],
      proposal: [],
      negotiation: [],
      closed_won: [],
      closed_lost: [],
    }

    deals.forEach((deal) => {
      if (grouped[deal.stage]) {
        grouped[deal.stage].push(deal)
      }
    })

    return grouped
  }, [deals])

  // Calcular valor total por stage
  const stageValues = useMemo(() => {
    const values: Record<DealStage, number> = {
      no_contact: 0,
      qualification: 0,
      proposal: 0,
      negotiation: 0,
      closed_won: 0,
      closed_lost: 0,
    }

    deals.forEach((deal) => {
      if (values[deal.stage] !== undefined) {
        values[deal.stage] += deal.value || 0
      }
    })

    return values
  }, [deals])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const deal = deals.find((d) => d.id === active.id)
    setActiveDeal(deal || null)
    setOriginalStage(deal?.stage || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeDeal = deals.find((d) => d.id === active.id)
    if (!activeDeal) return

    // Si se está arrastrando sobre una columna (stage)
    const overStage = STAGES.find((s) => s.id === over.id)?.id
    if (overStage && activeDeal.stage !== overStage) {
      setDeals((prevDeals) =>
        prevDeals.map((d) =>
          d.id === activeDeal.id ? { ...d, stage: overStage } : d
        )
      )
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || !originalStage) {
      setActiveDeal(null)
      setOriginalStage(null)
      return
    }

    const activeDeal = deals.find((d) => d.id === active.id)
    if (!activeDeal) {
      setActiveDeal(null)
      setOriginalStage(null)
      return
    }

    const overStage = STAGES.find((s) => s.id === over.id)?.id
    if (overStage && originalStage !== overStage) {
      // Actualizar en la base de datos
      try {
        const response = await fetch(`/api/crm/deals/${activeDeal.id}/stage`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: overStage }),
        })

        if (!response.ok) {
          throw new Error('Failed to update deal stage')
        }

        const { data: updatedDeal } = await response.json()

        // Actualizar el estado local inmediatamente con el deal actualizado
        // Esto incluye el email_sent que se resetea cuando cambia el stage
        setDeals((prevDeals) =>
          prevDeals.map((d) =>
            d.id === activeDeal.id 
              ? { 
                  ...d, 
                  ...updatedDeal,
                  // Asegurar que email_sent se actualice correctamente
                  email_sent: updatedDeal.email_sent !== undefined 
                    ? updatedDeal.email_sent 
                    : false // Si cambió el stage, email_sent debería ser false
                } 
              : d
          )
        )

        // Refrescar la página para sincronizar con el servidor
        router.refresh()
      } catch (error) {
        console.error('Error updating deal stage:', error)
        // Revertir el cambio en caso de error
        setDeals((prevDeals) =>
          prevDeals.map((d) =>
            d.id === activeDeal.id
              ? { ...d, stage: originalStage }
              : d
          )
        )
      }
    }

    setActiveDeal(null)
    setOriginalStage(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto">
        {STAGES.map((stage) => {
          const stageDeals = dealsByStage[stage.id]
          const stageValue = stageValues[stage.id]

          return (
            <div key={stage.id} className="flex flex-col gap-3">
              {/* Columna Header */}
              <Card className="p-4 bg-white sticky top-0 z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <h3 className="font-semibold text-sm">
                      {lang === 'en' ? stage.label_en : stage.label_es}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {stageDeals.length}{' '}
                      {stageDeals.length === 1
                        ? lang === 'en'
                          ? 'deal'
                          : 'negocio'
                        : lang === 'en'
                        ? 'deals'
                        : 'negocios'}
                    </span>
                    <span className="font-semibold">{formatCurrency(stageValue)}</span>
                  </div>
                </div>
              </Card>

              {/* Dropzone para la columna */}
              <SortableContext
                id={stage.id}
                items={stageDeals.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                <DroppableColumn id={stage.id} hasDeals={stageDeals.length > 0}>
                  {stageDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} lang={lang} />
                  ))}
                </DroppableColumn>
              </SortableContext>
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeDeal ? (
          <div className="opacity-80 rotate-3 scale-105">
            <DealCard deal={activeDeal as any} lang={lang} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
