'use client'

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2, MessageSquare } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { Feedback } from '@/types/database'

interface FeedbacksTableProps {
  feedbacks: Feedback[]
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const columns: ColumnDef<Feedback>[] = [
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
        const canDelete = feedback.status === 'pending'

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
              {canDelete && (
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
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          {dict.dashboard.empty.feedbacks.description}
        </p>
      </div>
    )
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={feedbacks}
        searchKey="title"
        dict={dict}
        lang={lang}
      />

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

