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
import type { Contact, ContactType } from '@/types/database'
import { useRouter } from 'next/navigation'

interface ContactsKanbanBoardProps {
  contacts: Contact[]
  lang: string
}

const STAGES: { id: ContactType; label_en: string; label_es: string; color: string }[] = [
  { id: 'lead', label_en: 'Leads', label_es: 'Leads', color: 'bg-blue-500/10' },
  { id: 'prospect', label_en: 'Prospects', label_es: 'Prospectos', color: 'bg-purple-500/10' },
  { id: 'customer', label_en: 'Customers', label_es: 'Clientes', color: 'bg-green-500/10' },
  { id: 'partner', label_en: 'Partners', label_es: 'Socios', color: 'bg-orange-500/10' },
]

function DroppableColumn({ id, hasContacts, children }: { id: string; hasContacts: boolean; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`h-full min-h-[400px] rounded-lg p-4 transition-colors ${
        hasContacts ? 'bg-gray-50/50' : 'bg-gray-50/30'
      }`}
    >
      {children}
    </div>
  )
}

export function ContactsKanbanBoard({ contacts: initialContacts, lang }: ContactsKanbanBoardProps) {
  const router = useRouter()
  const [contacts, setContacts] = useState(initialContacts)
  const [activeContact, setActiveContact] = useState<Contact | null>(null)
  const [originalType, setOriginalType] = useState<ContactType | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Agrupar contactos por tipo
  const contactsByType = useMemo(() => {
    const grouped: Record<ContactType, typeof contacts> = {
      lead: [],
      prospect: [],
      customer: [],
      partner: [],
    }

    contacts.forEach((contact) => {
      if (grouped[contact.contact_type]) {
        grouped[contact.contact_type].push(contact)
      }
    })

    return grouped
  }, [contacts])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const contact = contacts.find((c) => c.id === active.id)
    setActiveContact(contact || null)
    setOriginalType(contact?.contact_type || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Puedes agregar lógica aquí si necesitas feedback visual durante el arrastre
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      setActiveContact(null)
      setOriginalType(null)
      return
    }

    const contactId = active.id as string
    const newType = over.id as ContactType

    // Verificar que el nuevo tipo sea válido
    if (!STAGES.find((s) => s.id === newType)) {
      setActiveContact(null)
      setOriginalType(null)
      return
    }

    const contact = contacts.find((c) => c.id === contactId)
    if (!contact || contact.contact_type === newType) {
      setActiveContact(null)
      setOriginalType(null)
      return
    }

    // Optimistic update
    setContacts((prevContacts) =>
      prevContacts.map((c) =>
        c.id === contactId ? { ...c, contact_type: newType } : c
      )
    )

    try {
      // Actualizar en la base de datos
      const response = await fetch(`/api/crm/contacts/${contactId}/type`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contact_type: newType }),
      })

      if (!response.ok) {
        throw new Error('Failed to update contact type')
      }

      // Refrescar la página para obtener datos actualizados
      router.refresh()
    } catch (error) {
      console.error('Error updating contact type:', error)
      // Revertir el cambio optimista
      setContacts((prevContacts) =>
        prevContacts.map((c) =>
          c.id === contactId ? { ...c, contact_type: originalType || c.contact_type } : c
        )
      )
    } finally {
      setActiveContact(null)
      setOriginalType(null)
    }
  }

  const getStageLabel = (stageId: ContactType) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageContacts = contactsByType[stage.id] || []

          return (
            <div key={stage.id} className="flex flex-col min-w-[280px]">
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
                  <DroppableColumn id={stage.id} hasContacts={stageContacts.length > 0}>
                    <div className="space-y-3">
                      {stageContacts.map((contact) => (
                        <ContactCard
                          key={contact.id}
                          contact={contact}
                          lang={lang}
                        />
                      ))}
                      {stageContacts.length === 0 && (
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
          <div className="opacity-80 rotate-3 scale-105">
            <ContactCard contact={activeContact} lang={lang} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
