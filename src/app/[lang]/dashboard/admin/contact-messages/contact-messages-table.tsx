'use client'

import { ContactMessage } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Trash2, Eye, Archive, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { formatPhoneNumber } from '@/lib/utils/format-phone'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ContactMessagesTableProps {
  messages: ContactMessage[]
  lang: string
}

export function ContactMessagesTable({ messages, lang }: ContactMessagesTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const router = useRouter()

  const statusColors = {
    unread: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    read: 'bg-white text-gray-600 border-gray-500/20',
    replied: 'bg-green-500/10 text-green-600 border-green-500/20',
    archived: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  }

  const getStatusLabel = (status: ContactMessage['status']) => {
    const labels = {
      unread: lang === 'en' ? 'Unread' : 'No leído',
      read: lang === 'en' ? 'Read' : 'Leído',
      replied: lang === 'en' ? 'Replied' : 'Respondido',
      archived: lang === 'en' ? 'Archived' : 'Archivado',
    }
    return labels[status]
  }

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'en' ? 'Are you sure you want to delete this message?' : '¿Estás seguro de que quieres eliminar este mensaje?')) {
      return
    }

    setIsDeleting(id)
    const supabase = createClient()

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting message:', error)
      alert(lang === 'en' ? 'Error deleting message' : 'Error al eliminar el mensaje')
    } else {
      router.refresh()
    }

    setIsDeleting(null)
  }

  const handleUpdateStatus = async (id: string, status: ContactMessage['status']) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('Error updating status:', error)
      alert(lang === 'en' ? 'Error updating status' : 'Error al actualizar el estado')
    } else {
      router.refresh()
    }
  }

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message)

    // Marcar como leído si no está leído
    if (message.status === 'unread') {
      await handleUpdateStatus(message.id, 'read')
    }
  }

  if (messages.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {lang === 'en' ? 'No messages yet' : 'No hay mensajes aún'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {lang === 'en'
            ? 'Messages from your contact form will appear here'
            : 'Los mensajes de tu formulario de contacto aparecerán aquí'}
        </p>
      </Card>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-white">
              <tr>
                <th className="px-6 py-3 text-left font-medium">
                  {lang === 'en' ? 'Name' : 'Nombre'}
                </th>
                <th className="px-6 py-3 text-left font-medium">
                  {lang === 'en' ? 'Contact' : 'Contacto'}
                </th>
                <th className="px-6 py-3 text-left font-medium">
                  {lang === 'en' ? 'Message' : 'Mensaje'}
                </th>
                <th className="px-6 py-3 text-left font-medium">
                  {lang === 'en' ? 'Status' : 'Estado'}
                </th>
                <th className="px-6 py-3 text-left font-medium">
                  {lang === 'en' ? 'Date' : 'Fecha'}
                </th>
                <th className="px-6 py-3 text-right font-medium">
                  {lang === 'en' ? 'Actions' : 'Acciones'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {messages.map((message) => (
                <tr key={message.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">
                      {message.first_name} {message.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Mail className="size-4 text-muted-foreground" />
                        <a
                          href={`mailto:${message.email}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {message.email}
                        </a>
                      </div>
                      {message.phone_number && (
                        <div className="flex items-center gap-2">
                          <Phone className="size-4 text-muted-foreground" />
                          <a
                            href={`tel:${message.phone_number}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {formatPhoneNumber(message.phone_number)}
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {message.message}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={statusColors[message.status]}>
                      {getStatusLabel(message.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-muted-foreground">
                      {new Date(message.created_at || '').toLocaleDateString(
                        lang === 'en' ? 'en-US' : 'es-MX',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewMessage(message)}
                      >
                        <Eye className="size-4" />
                      </Button>

                      {message.status !== 'replied' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdateStatus(message.id, 'replied')}
                          title={lang === 'en' ? 'Mark as replied' : 'Marcar como respondido'}
                        >
                          <MailCheck className="size-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleUpdateStatus(
                            message.id,
                            message.status === 'archived' ? 'read' : 'archived'
                          )
                        }
                        title={
                          message.status === 'archived'
                            ? lang === 'en'
                              ? 'Unarchive'
                              : 'Desarchivar'
                            : lang === 'en'
                            ? 'Archive'
                            : 'Archivar'
                        }
                      >
                        <Archive className="size-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(message.id)}
                        disabled={isDeleting === message.id}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog para ver el mensaje completo */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {lang === 'en' ? 'Contact Message' : 'Mensaje de Contacto'}
            </DialogTitle>
            <DialogDescription>
              {lang === 'en' ? 'Message details' : 'Detalles del mensaje'}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {lang === 'en' ? 'Name' : 'Nombre'}
                  </label>
                  <p className="text-sm mt-1">
                    {selectedMessage.first_name} {selectedMessage.last_name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {lang === 'en' ? 'Date' : 'Fecha'}
                  </label>
                  <p className="text-sm mt-1">
                    {new Date(selectedMessage.created_at || '').toLocaleDateString(
                      lang === 'en' ? 'en-US' : 'es-MX',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm mt-1">
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-primary hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </p>
                </div>

                {selectedMessage.phone_number && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {lang === 'en' ? 'Phone' : 'Teléfono'}
                    </label>
                    <p className="text-sm mt-1">
                      <a
                        href={`tel:${selectedMessage.phone_number}`}
                        className="text-primary hover:underline"
                      >
                        {formatPhoneNumber(selectedMessage.phone_number)}
                      </a>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {lang === 'en' ? 'Message' : 'Mensaje'}
                </label>
                <div className="mt-2 p-4 bg-white rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() =>
                    handleUpdateStatus(
                      selectedMessage.id,
                      selectedMessage.status === 'archived' ? 'read' : 'archived'
                    )
                  }
                >
                  <Archive className="size-4 mr-2" />
                  {selectedMessage.status === 'archived'
                    ? lang === 'en'
                      ? 'Unarchive'
                      : 'Desarchivar'
                    : lang === 'en'
                    ? 'Archive'
                    : 'Archivar'}
                </Button>

                {selectedMessage.status !== 'replied' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                  >
                    <MailCheck className="size-4 mr-2" />
                    {lang === 'en' ? 'Mark as Replied' : 'Marcar como Respondido'}
                  </Button>
                )}

                <Button
                  variant="outline"
                  asChild
                >
                  <a href={`mailto:${selectedMessage.email}`}>
                    <Mail className="size-4 mr-2" />
                    {lang === 'en' ? 'Reply' : 'Responder'}
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
