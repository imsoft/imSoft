'use client'

import { ColumnDef } from "@tanstack/react-table"
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
import { useState, useEffect } from "react"
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
import { Building2, Plus, ArrowUpDown, MoreHorizontal, Pencil, Trash2, User } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import Image from "next/image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { Company } from '@/types/database'

interface AdminCompaniesTableProps {
  companies: Company[]
  dict: Dictionary
  lang: Locale
}

export function AdminCompaniesTable({ companies, dict, lang }: AdminCompaniesTableProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [usersMap, setUsersMap] = useState<Map<string, { email: string; full_name: string | null }>>(new Map())

  // Fetch users for companies that have user_id
  useEffect(() => {
    const fetchUsers = async () => {
      const userIds = companies
        .map(c => c.user_id)
        .filter((id): id is string => id !== null && id !== undefined)
      
      if (userIds.length === 0) return

      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const users = await response.json()
          const map = new Map<string, { email: string; full_name: string | null }>()
          users.forEach((user: any) => {
            if (userIds.includes(user.id)) {
              map.set(user.id, {
                email: user.email || '',
                full_name: user.full_name || null
              })
            }
          })
          setUsersMap(map)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [companies])

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || dict.companies.deleteError)
      }

      router.refresh()
      setDeleteDialogOpen(false)
      setDeletingId(null)
      toast.success(dict.companies.deleteSuccess)
    } catch (error) {
      console.error('Error deleting company:', error)
      toast.error(dict.companies.deleteError, {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<Company>[] = [
    {
      id: "logo",
      accessorKey: "logo_url",
      header: () => <div className="text-center">{dict.companies.logo}</div>,
      cell: ({ row }) => {
        const logoUrl = row.original.logo_url as string | null | undefined
        const name = row.original.name
        return (
          <div className="flex justify-center">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name}
                width={40}
                height={40}
                className="rounded-md object-cover"
              />
            ) : (
              <Avatar className="size-10">
                <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                  {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        )
      },
    },
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {dict.companies.name}
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div className="font-medium">{row.original.name}</div>
      },
    },
    {
      id: "user",
      accessorKey: "user_id",
      header: () => <div>{lang === 'en' ? 'User' : 'Usuario'}</div>,
      cell: ({ row }) => {
        const userId = row.original.user_id as string | null | undefined
        if (!userId) {
          return (
            <span className="text-muted-foreground text-sm italic">
              {lang === 'en' ? 'No user assigned' : 'Sin usuario asignado'}
            </span>
          )
        }
        const user = usersMap.get(userId)
        if (user) {
          return (
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <span className="text-sm">
                {user.full_name || user.email}
              </span>
            </div>
          )
        }
        return <span className="text-muted-foreground text-sm">-</span>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const company = row.original

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{dict.dashboard.admin.crud.actions}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{dict.dashboard.admin.crud.actions}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${lang}/dashboard/admin/companies/${company.id}/edit`}>
                    <Pencil className="mr-2 size-4" />
                    {dict.dashboard.admin.crud.edit}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setDeletingId(company.id)
                    setDeleteDialogOpen(true)
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 size-4 text-destructive" />
                  {dict.dashboard.admin.crud.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )
      },
    },
  ]

  if (companies.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia className="bg-primary/10 text-primary">
            <Building2 className="size-8" />
          </EmptyMedia>
          <EmptyTitle>{dict.dashboard.empty.companies.title}</EmptyTitle>
          <EmptyDescription>{dict.dashboard.empty.companies.description}</EmptyDescription>
        </EmptyHeader>
        <EmptyAction>
          <Button asChild>
            <Link href={`/${lang}/dashboard/admin/companies/new`}>
              <Plus className="mr-1.5 size-4" />
              {dict.companies.create}
            </Link>
          </Button>
        </EmptyAction>
      </Empty>
    )
  }

  return (
    <>
      <DataTable 
        columns={columns} 
        data={companies} 
        searchKey="name" 
        searchPlaceholder={dict.companies.searchCompany}
        dict={dict} 
        lang={lang} 
      />
      <Dialog open={deleteDialogOpen && deletingId !== null} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dict.companies.deleteConfirm.title}</DialogTitle>
            <DialogDescription>
              {dict.companies.deleteConfirm.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeletingId(null)
              }}
              disabled={isDeleting}
            >
              {dict.dashboard.admin.crud.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && handleDelete(deletingId)}
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

