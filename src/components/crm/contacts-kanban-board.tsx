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
import { Badge } from '@/components/ui/badge'
import { ContactCard } from './contact-card'
import type { Contact, ContactStatus } from '@/types/database'
import { useRouter } from 'next/navigation'
import { Rocket, Target, TrendingUp, Trophy, AlertCircle } from 'lucide-react'

interface ContactsKanbanBoardProps {
  contacts: Contact[]
  lang: string
}

const STAGES: { id: ContactStatus; label_en: string; label_es: string; color: string }[] = [
  { id: 'no_contact', label_en: 'No Contact', label_es: 'Sin Contacto', color: 'bg-gray-500/10' },
  { id: 'qualification', label_en: 'Prospecting', label_es: 'Prospección', color: 'bg-blue-500/10' },
  { id: 'negotiation', label_en: 'Negotiation', label_es: 'Negociación', color: 'bg-purple-500/10' },
  { id: 'closed_won', label_en: 'Won', label_es: 'Ganados', color: 'bg-green-500/10' },
  { id: 'closed_lost', label_en: 'Lost', label_es: 'Perdidos', color: 'bg-red-500/10' },
]

function DroppableColumn({ id, hasContacts, children, isOver, lang }: { id: string; hasContacts: boolean; children: React.ReactNode; isOver?: boolean; lang: string }) {
  const { setNodeRef, isOver: droppableIsOver } = useDroppable({ id })
  const showDropIndicator = isOver || droppableIsOver

  return (
    <div
      ref={setNodeRef}
      className={`h-full min-h-[400px] rounded-lg p-4 transition-all duration-200 ${
        showDropIndicator
          ? 'bg-primary/5 border-2 border-dashed border-primary ring-2 ring-primary/20'
          : hasContacts
          ? 'bg-gray-50/50 border-2 border-transparent'
          : 'bg-gray-50/30 border-2 border-transparent'
      }`}
    >
      {showDropIndicator && (
        <div className="mb-3 text-center animate-pulse">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/30">
            <span className="text-primary font-semibold">↓ {lang === 'en' ? 'Drop here' : 'Soltar aquí'} ↓</span>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

export function ContactsKanbanBoard({ contacts: initialContacts, lang }: ContactsKanbanBoardProps) {
  const router = useRouter()
  const [contacts, setContacts] = useState(initialContacts)
  const [activeContact, setActiveContact] = useState<Contact | null>(null)
  const [originalStatus, setOriginalStatus] = useState<ContactStatus | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Agrupar contactos por estado
  const contactsByStatus = useMemo(() => {
    const grouped: Record<ContactStatus, typeof contacts> = {
      no_contact: [],
      qualification: [],
      negotiation: [],
      closed_won: [],
      closed_lost: [],
    }

    contacts.forEach((contact) => {
      // Si el contacto tiene un status válido, agruparlo
      if (grouped[contact.status as ContactStatus]) {
        grouped[contact.status as ContactStatus].push(contact)
      } else {
        // Si no tiene un status válido, ponerlo en no_contact por defecto
        grouped.no_contact.push(contact)
      }
    })

    return grouped
  }, [contacts])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const contact = contacts.find((c) => c.id === active.id)
    setActiveContact(contact || null)
    setOriginalStatus((contact?.status as ContactStatus) || 'no_contact')
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (over) {
      // Verificar si el over es directamente una columna (stage)
      const isStage = STAGES.find((s) => s.id === over.id)
      if (isStage) {
        setOverId(over.id as string)
      } else {
        // Si es una card, buscar en qué columna está esa card
        const contact = contacts.find((c) => c.id === over.id)
        if (contact) {
          // Usar el status de esa card para identificar la columna
          setOverId(contact.status as string)
        } else {
          setOverId(null)
        }
      }
    } else {
      setOverId(null)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setOverId(null)
    
    if (!over) {
      setActiveContact(null)
      setOriginalStatus(null)
      return
    }

    const contactId = active.id as string
    
    // Determinar el nuevo estado
    let newStatus: ContactStatus | null = null
    
    // Verificar si el over es directamente una columna (stage)
    const isStage = STAGES.find((s) => s.id === over.id)
    if (isStage) {
      // Si es directamente una columna, usar su ID
      newStatus = over.id as ContactStatus
    } else {
      // Si el over es una card, obtener el status de esa card para identificar la columna
      const overContact = contacts.find((c) => c.id === over.id)
      if (overContact) {
        newStatus = overContact.status as ContactStatus
      }
    }

    // Si no se pudo determinar el nuevo estado, cancelar
    if (!newStatus || !STAGES.find((s) => s.id === newStatus)) {
      console.log('No se pudo determinar el nuevo estado:', { overId: over.id, newStatus })
      setActiveContact(null)
      setOriginalStatus(null)
      setOverId(null)
      return
    }

    console.log('Actualizando contacto:', { contactId, from: originalStatus, to: newStatus })

    const contact = contacts.find((c) => c.id === contactId)
    if (!contact || contact.status === newStatus) {
      setActiveContact(null)
      setOriginalStatus(null)
      setOverId(null)
      return
    }

    // Optimistic update
    setContacts((prevContacts) =>
      prevContacts.map((c) =>
        c.id === contactId ? { ...c, status: newStatus } : c
      )
    )

    try {
      // Actualizar en la base de datos
      const response = await fetch(`/api/crm/contacts/${contactId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to update contact status:', errorData)
        throw new Error('Failed to update contact status')
      }

      const result = await response.json()
      console.log('Contact status updated successfully:', result)

      // El estado ya fue actualizado optimísticamente, solo refrescar para sincronizar con el servidor
      // Usar setTimeout para dar tiempo a que la actualización se complete
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (error) {
      console.error('Error updating contact status:', error)
      // Revertir el cambio optimista
      setContacts((prevContacts) =>
        prevContacts.map((c) =>
          c.id === contactId ? { ...c, status: originalStatus || (c.status as ContactStatus) } : c
        )
      )
    } finally {
      setActiveContact(null)
      setOriginalStatus(null)
      setOverId(null)
    }
  }

  const getStageLabel = (stageId: ContactStatus) => {
    const stage = STAGES.find((s) => s.id === stageId)
    return lang === 'en' ? stage?.label_en || stageId : stage?.label_es || stageId
  }

  const getEmptyStateContent = (stageId: ContactStatus) => {
    const emptyStates: Record<ContactStatus, { icon: React.ReactNode; message: { en: string; es: string }; emoji: string }> = {
      no_contact: {
        icon: <Target className="h-8 w-8 text-blue-500" />,
        message: {
          en: 'Ready to start? Add your first contact! 🎯',
          es: '¡Listo para comenzar! Agrega tu primer contacto 🎯'
        },
        emoji: '🎯'
      },
      qualification: {
        icon: <Rocket className="h-8 w-8 text-blue-600" />,
        message: {
          en: 'Let\'s find new opportunities! 🚀',
          es: '¡Busquemos nuevas oportunidades! 🚀'
        },
        emoji: '🚀'
      },
      negotiation: {
        icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
        message: {
          en: 'Time to close deals! 💼',
          es: '¡Es hora de cerrar negocios! 💼'
        },
        emoji: '💼'
      },
      closed_won: {
        icon: <Trophy className="h-8 w-8 text-green-600" />,
        message: {
          en: 'Victory! 🏆 Keep up the great work!',
          es: '¡Victoria! 🏆 ¡Sigue así!'
        },
        emoji: '🏆'
      },
      closed_lost: {
        icon: <AlertCircle className="h-8 w-8 text-red-500" />,
        message: {
          en: 'Learn and move forward! 💪',
          es: '¡Aprende y sigue adelante! 💪'
        },
        emoji: '💪'
      },
    }

    return emptyStates[stageId] || emptyStates.no_contact
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-5 gap-4 pb-4">
        {STAGES.map((stage) => {
          const stageContacts = contactsByStatus[stage.id] || []

          return (
            <div key={stage.id} className="flex flex-col">
              <Card className={`p-4 ${stage.color} border-2 h-full min-h-[600px]`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">
                    {getStageLabel(stage.id)}
                  </h3>
                  <Badge variant="secondary" className="ml-2">
                    {stageContacts.length}
                  </Badge>
                </div>

                <SortableContext
                  id={stage.id}
                  items={stageContacts.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableColumn 
                    id={stage.id} 
                    hasContacts={stageContacts.length > 0}
                    isOver={overId === stage.id}
                    lang={lang}
                  >
                    <div className="space-y-3">
                      {stageContacts.map((contact) => (
                        <ContactCard
                          key={contact.id}
                          contact={contact}
                          lang={lang}
                        />
                      ))}
                      {stageContacts.length === 0 && !overId && (() => {
                        const emptyContent = getEmptyStateContent(stage.id)
                        return (
                          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="mb-4 relative">
                              <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-full border-2 border-dashed border-primary/30">
                                {emptyContent.icon}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-base font-semibold text-foreground/80 leading-relaxed">
                                {lang === 'en' ? emptyContent.message.en : emptyContent.message.es}
                              </p>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </DroppableColumn>
                </SortableContext>
              </Card>
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeContact ? (
          <div className="opacity-90 rotate-2 scale-105 shadow-2xl border-2 border-primary/50">
            <ContactCard contact={activeContact} lang={lang} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
