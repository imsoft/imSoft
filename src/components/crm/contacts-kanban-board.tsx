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
    setOverId(over ? over.id as string : null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setOverId(null)
    
    if (!over || active.id === over.id) {
      setActiveContact(null)
      setOriginalStatus(null)
      return
    }

    const contactId = active.id as string
    const newStatus = over.id as ContactStatus

    // Verificar que el nuevo estado sea válido
    if (!STAGES.find((s) => s.id === newStatus)) {
      setActiveContact(null)
      setOriginalStatus(null)
      setOverId(null)
      return
    }

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
        throw new Error('Failed to update contact status')
      }

      // Refrescar la página para obtener datos actualizados
      router.refresh()
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pb-4">
        {STAGES.map((stage) => {
          const stageContacts = contactsByStatus[stage.id] || []

          return (
            <div key={stage.id} className="flex flex-col">
              <Card className={`p-4 ${stage.color} border-2`}>
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
                      {stageContacts.length === 0 && !overId && (
                        <div className="text-center text-sm text-muted-foreground py-8">
                          {lang === 'en' ? 'No contacts' : 'Sin contactos'}
                        </div>
                      )}
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
