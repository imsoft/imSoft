'use client'

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MoreHorizontal, Trash2, Eye } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { Feedback } from '@/types/database'

interface FeedbackWithUser extends Feedback {
  user_email?: string
  user_name?: string
}

interface FeedbacksTableProps {
  feedbacks: FeedbackWithUser[]
  dict: Dictionary
  lang: Locale
}

const getStatusBadge = (status: Feedback['status'], dict: Dictionary) => {
  const statusMap = {
    pending: { label: dict.feedback.statusPending, variant: 'secondary' as const },
    reviewed: { label: dict.feedback.statusReviewed, variant: 'default' as const },
    'in-progress': { label: dict.feedback.statusInProgress, variant: 'default' as const },
    completed: { label: dict.feedback.statusCompleted, variant: 'default' as const },
    rejected: { label: dict.feedback.statusRejected, variant: 'destructive' as const },
  }
  const statusInfo = statusMap[status] || statusMap.pending
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
}

export function FeedbacksTable({ feedbacks, dict, lang }: FeedbacksTableProps) {
  const router = useRouter()
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackWithUser | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [status, setStatus] = useState<Feedback['status']>('pending')
  const [adminNotes, setAdminNotes] = useState('')

  const handleView = (feedback: FeedbackWithUser) => {
    setSelectedFeedback(feedback)
    setStatus(feedback.status)
    setAdminNotes(feedback.admin_notes || '')
    setViewDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedFeedback) return

    setIsUpdating(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('feedbacks')
        .update({
          status,
          admin_notes: adminNotes || null,
        })
        .eq('id', selectedFeedback.id)

      if (error) throw error

      router.refresh()
      setViewDialogOpen(false)
      setSelectedFeedback(null)
      toast.success(dict.feedback.updateSuccess)
    } catch (error) {
      console.error('Error updating feedback:', error)
      toast.error(dict.feedback.updateError, {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('feedbacks')
        .delete()
        .eq('id', id)

      if (error) throw error

      router.refresh()
      setDeleteDialogOpen(false)
      setDeletingId(null)
      toast.success(dict.feedback.deleteSuccess)
    } catch (error) {
      console.error('Error deleting feedback:', error)
      toast.error(dict.feedback.deleteError, {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<FeedbackWithUser>[] = [
    {
      id: "user",
      accessorKey: "user_name",
      header: dict.feedback.user,
      cell: ({ row }) => {
        const name = row.original.user_name || row.original.user_email || 'Unknown'
        const email = row.original.user_email
        return (
          <div>
            <div className="font-medium">{name}</div>
            {email && email !== name && (
              <div className="text-sm text-muted-foreground">{email}</div>
            )}
          </div>
        )
      },
    },
    {
      id: "title",
      accessorKey: "title",
      header: dict.feedback.titleLabel,
    },
    {
      id: "status",
      accessorKey: "status",
      header: dict.feedback.status,
      cell: ({ row }) => getStatusBadge(row.original.status, dict),
    },
    {
      id: "created_at",
      accessorKey: "created_at",
      header: dict.feedback.createdAt,
      cell: ({ row }) => {
        const date = row.original.created_at
          ? new Date(row.original.created_at)
          : null
        return date
          ? date.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : '-'
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const feedback = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{dict.dashboard.admin.crud.actions}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleView(feedback)}>
                <Eye className="mr-2 h-4 w-4" />
                {lang === 'en' ? 'View' : 'Ver'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setDeletingId(feedback.id)
                  setDeleteDialogOpen(true)
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                {dict.dashboard.admin.crud.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={feedbacks}
        searchKey="title"
        dict={dict}
        lang={lang}
      />

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedFeedback?.title}</DialogTitle>
            <DialogDescription>
              {selectedFeedback && (
                <div className="space-y-2 mt-2">
                  <div>
                    <span className="font-medium">{dict.feedback.user}:</span>{' '}
                    {selectedFeedback.user_name || selectedFeedback.user_email || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">{dict.feedback.status}:</span>{' '}
                    {getStatusBadge(selectedFeedback.status, dict)}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{dict.feedback.descriptionLabel}</label>
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                {selectedFeedback?.description}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{dict.feedback.status}</label>
              <Select value={status} onValueChange={(value) => setStatus(value as Feedback['status'])}>
                <SelectTrigger className="w-full !border-2 !border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{dict.feedback.statusPending}</SelectItem>
                  <SelectItem value="reviewed">{dict.feedback.statusReviewed}</SelectItem>
                  <SelectItem value="in-progress">{dict.feedback.statusInProgress}</SelectItem>
                  <SelectItem value="completed">{dict.feedback.statusCompleted}</SelectItem>
                  <SelectItem value="rejected">{dict.feedback.statusRejected}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{dict.feedback.adminNotes}</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="!border-2 !border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setViewDialogOpen(false)
                setSelectedFeedback(null)
              }}
            >
              {dict.dashboard.admin.crud.cancel}
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? dict.dashboard.admin.crud.save : dict.dashboard.admin.crud.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dict.feedback.deleteConfirm.title}</DialogTitle>
            <DialogDescription>
              {dict.feedback.deleteConfirm.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeletingId(null)
              }}
            >
              {dict.dashboard.admin.crud.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingId) {
                  handleDelete(deletingId)
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? dict.dashboard.admin.crud.deleting : dict.dashboard.admin.crud.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

