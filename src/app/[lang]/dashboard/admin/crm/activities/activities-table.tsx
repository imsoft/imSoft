'use client'

import { Activity } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Edit, Trash2, Phone, Mail, Calendar, FileText, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ActivitiesTableProps {
  activities: Activity[]
  dict: any
  lang: string
}

export function ActivitiesTable({ activities, dict, lang }: ActivitiesTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'en' ? 'Are you sure you want to delete this activity?' : '¿Estás seguro de que quieres eliminar esta actividad?')) {
      return
    }

    setIsDeleting(id)
    const supabase = createClient()

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting activity:', error)
      alert(lang === 'en' ? 'Error deleting activity' : 'Error al eliminar actividad')
    } else {
      router.refresh()
    }

    setIsDeleting(null)
  }

  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; es: string }> = {
      call: { en: 'Call', es: 'Llamada' },
      email: { en: 'Email', es: 'Correo' },
      meeting: { en: 'Meeting', es: 'Reunión' },
      note: { en: 'Note', es: 'Nota' },
      task: { en: 'Task', es: 'Tarea' },
    }
    return lang === 'en' ? labels[type]?.en || type : labels[type]?.es || type
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; es: string }> = {
      completed: { en: 'Completed', es: 'Completado' },
      scheduled: { en: 'Scheduled', es: 'Programado' },
      cancelled: { en: 'Cancelled', es: 'Cancelado' },
    }
    return lang === 'en' ? labels[status]?.en || status : labels[status]?.es || status
  }

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      call: Phone,
      email: Mail,
      meeting: Calendar,
      note: FileText,
      task: CheckSquare,
    }
    const Icon = icons[type] || FileText
    return <Icon className="size-4" />
  }

  const activityTypeColors: Record<string, string> = {
    call: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    email: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    meeting: 'bg-green-500/10 text-green-700 dark:text-green-400',
    note: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    task: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  }

  const statusColors: Record<string, string> = {
    completed: 'bg-green-500/10 text-green-700 dark:text-green-400',
    scheduled: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    cancelled: 'bg-red-500/10 text-red-700 dark:text-red-400',
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString(lang === 'en' ? 'en-US' : 'es-MX', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  if (activities.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <p className="text-muted-foreground">
            {lang === 'en' ? 'No activities yet. Log your first activity!' : '¡No hay actividades todavía. Registra tu primera actividad!'}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">
                {lang === 'en' ? 'Type' : 'Tipo'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                {lang === 'en' ? 'Subject' : 'Asunto'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                {lang === 'en' ? 'Contact' : 'Contacto'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                {lang === 'en' ? 'Deal' : 'Negocio'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                {lang === 'en' ? 'Status' : 'Estado'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                {lang === 'en' ? 'Date' : 'Fecha'}
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium">
                {lang === 'en' ? 'Actions' : 'Acciones'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {activities.map((activity: any) => (
              <tr key={activity.id} className="hover:bg-muted/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.activity_type)}
                    <Badge className={activityTypeColors[activity.activity_type]}>
                      {getActivityTypeLabel(activity.activity_type)}
                    </Badge>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{activity.subject}</p>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {activity.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {activity.contacts ? (
                    <div>
                      <p className="text-sm">
                        {activity.contacts.first_name} {activity.contacts.last_name}
                      </p>
                      {activity.contacts.company && (
                        <p className="text-xs text-muted-foreground">{activity.contacts.company}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {activity.deals ? (
                    <span className="text-sm">{activity.deals.title}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Badge className={statusColors[activity.status]}>
                    {getStatusLabel(activity.status)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm">
                      {formatDate(activity.scheduled_at || activity.completed_at || activity.created_at)}
                    </p>
                    {activity.duration_minutes && (
                      <p className="text-xs text-muted-foreground">
                        {activity.duration_minutes} {lang === 'en' ? 'min' : 'min'}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/${lang}/dashboard/admin/crm/activities/${activity.id}`}>
                        <Eye className="size-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/${lang}/dashboard/admin/crm/activities/${activity.id}/edit`}>
                        <Edit className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(activity.id)}
                      disabled={isDeleting === activity.id}
                      className="text-destructive hover:text-destructive"
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
    </Card>
  )
}
