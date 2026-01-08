'use client'

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
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
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyAction,
} from "@/components/ui/empty"
import { Users, Plus } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'

interface User {
  id: string
  email?: string
  user_metadata?: {
    first_name?: string
    last_name?: string
    company_name?: string
    full_name?: string
    role?: string
  }
  created_at?: string
}

interface UsersTableProps {
  users: User[]
  dict: Dictionary
  lang: Locale
}

export function UsersTable({ users, dict, lang }: UsersTableProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al eliminar usuario')
      }

      router.refresh()
      setDeleteDialogOpen(false)
      setDeletingId(null)
      toast.success(lang === 'en' ? 'User deleted successfully' : 'Usuario eliminado exitosamente')
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(
        lang === 'en' ? 'Error deleting user' : 'Error al eliminar usuario',
        {
          description: error instanceof Error ? error.message : undefined,
        }
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      id: "name",
      accessorFn: (row) => {
        const metadata = row.user_metadata || {}
        return metadata.full_name || 
               (metadata.first_name && metadata.last_name
                 ? `${metadata.first_name} ${metadata.last_name}`
                 : row.email?.split('@')[0] || row.email)
      },
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {lang === 'en' ? 'Name' : 'Nombre'}
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const user = row.original
        const metadata = user.user_metadata || {}
        const name = metadata.full_name || 
                    (metadata.first_name && metadata.last_name
                      ? `${metadata.first_name} ${metadata.last_name}`
                      : user.email?.split('@')[0] || user.email)
        return <div className="font-medium">{name}</div>
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
    },
    {
      id: "company",
      accessorFn: (row) => row.user_metadata?.company_name || '-',
      header: () => <div>{lang === 'en' ? 'Company' : 'Empresa'}</div>,
    },
    {
      id: "role",
      accessorFn: (row) => row.user_metadata?.role || 'client',
      header: () => <div>{lang === 'en' ? 'Role' : 'Rol'}</div>,
      cell: ({ row }) => {
        const role = row.original.user_metadata?.role || 'client'
        return (
          <div className="capitalize">
            {role === 'admin' 
              ? (lang === 'en' ? 'Administrator' : 'Administrador')
              : (lang === 'en' ? 'Client' : 'Cliente')
            }
          </div>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original

        return (
          <>
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
                <DropdownMenuItem asChild>
                  <Link href={`/${lang}/dashboard/admin/users/${user.id}/edit`}>
                    <Pencil className="mr-2 size-4" />
                    {dict.dashboard.admin.crud.edit}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setDeletingId(user.id)
                    setDeleteDialogOpen(true)
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 size-4 text-destructive" />
                  {dict.dashboard.admin.crud.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={deleteDialogOpen && deletingId === user.id} onOpenChange={(open) => {
              setDeleteDialogOpen(open)
              if (!open) setDeletingId(null)
            }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{lang === 'en' ? 'Delete User' : 'Eliminar Usuario'}</DialogTitle>
                  <DialogDescription>
                    {dict.dashboard.admin.crud.confirmDelete}
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
                    onClick={() => handleDelete(user.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (lang === 'en' ? 'Deleting...' : 'Eliminando...') : dict.dashboard.admin.crud.delete}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )
      },
    },
  ]

  if (users.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users className="size-12" />
          </EmptyMedia>
          <EmptyTitle>{dict.dashboard.empty.users.title}</EmptyTitle>
          <EmptyDescription>
            {dict.dashboard.empty.users.description}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyAction>
          <Button asChild>
            <Link href={`/${lang}/dashboard/admin/users/new`}>
              <Plus className="mr-2 size-4" />
              {lang === 'en' ? 'Create User' : 'Crear Usuario'}
            </Link>
          </Button>
        </EmptyAction>
      </Empty>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={users}
      searchKey="email"
      searchPlaceholder={lang === 'en' ? 'Filter users...' : 'Filtrar usuarios...'}
      dict={dict}
      lang={lang}
    />
  )
}

