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
  DialogTrigger,
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
import { createClient } from "@/lib/supabase/client"
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
import { Building2, Plus, ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import Image from "next/image"
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { Company } from '@/types/database'

interface CompaniesTableProps {
  companies: Company[]
  dict: Dictionary
  lang: Locale
}

export function CompaniesTable({ companies, dict, lang }: CompaniesTableProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar la empresa')
      }

      router.refresh()
      setDeleteDialogOpen(false)
      setDeletingId(null)
      toast.success(lang === 'en' ? 'Company deleted successfully' : 'Empresa eliminada exitosamente')
    } catch (error) {
      console.error('Error deleting company:', error)
      toast.error(lang === 'en' ? 'Error deleting company' : 'Error al eliminar la empresa', {
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
        return (
          <div className="flex justify-center">
            {logoUrl ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-md">
                <Image
                  src={logoUrl}
                  alt={row.original.name}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
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
            {dict.companies.title}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue("name")}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const company = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{lang === 'en' ? 'Open menu' : 'Abrir menú'}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{lang === 'en' ? 'Actions' : 'Acciones'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${lang}/dashboard/client/companies/${company.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {dict.companies.edit}
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
                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                {dict.companies.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (companies.length === 0) {
    return (
      <Empty>
        <EmptyMedia>
          <Building2 />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>{dict.dashboard.empty.companies.title}</EmptyTitle>
          <EmptyDescription>{dict.dashboard.empty.companies.description}</EmptyDescription>
        </EmptyHeader>
        <EmptyAction>
          <Button asChild>
            <Link href={`/${lang}/dashboard/client/companies/new`}>
              <Plus className="mr-1.5 h-4 w-4" />
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
        searchPlaceholder={lang === 'en' ? 'Filter companies...' : 'Filtrar empresas...'}
        dict={dict} 
        lang={lang} 
      />
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{typeof dict.companies.deleteConfirm === 'object' ? dict.companies.deleteConfirm.title : dict.companies.delete}</DialogTitle>
            <DialogDescription>
              {typeof dict.companies.deleteConfirm === 'object' ? dict.companies.deleteConfirm.description : dict.companies.deleteConfirm}
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
              {lang === 'en' ? 'Cancel' : 'Cancelar'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && handleDelete(deletingId)}
              disabled={isDeleting}
            >
              {isDeleting
                ? lang === 'en' ? 'Deleting...' : 'Eliminando...'
                : dict.companies.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

