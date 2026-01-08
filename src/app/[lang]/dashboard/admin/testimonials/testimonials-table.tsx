'use client'

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyAction,
} from "@/components/ui/empty"
import { MessageSquare } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { Testimonial, TestimonialsTableProps } from '@/types'

export type { Testimonial }

export function TestimonialsTable({ testimonials, dict, lang }: TestimonialsTableProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [companiesMap, setCompaniesMap] = useState<Map<string, string>>(new Map())

  // Cargar empresas para mostrar sus nombres
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('companies')
          .select('id, name')

        if (error) throw error

        const map = new Map<string, string>()
        data?.forEach((company) => {
          map.set(company.id, company.name)
        })
        setCompaniesMap(map)
      } catch (error) {
        console.error('Error fetching companies:', error)
      }
    }

    fetchCompanies()
  }, [])

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id)

      if (error) throw error

      router.refresh()
      setDeleteDialogOpen(false)
      setDeletingId(null)
    } catch (error) {
      console.error('Error deleting testimonial:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<Testimonial>[] = [
    {
      id: "company",
      accessorFn: (row) => {
        const companyId = row.company_id
        return companyId 
          ? (companiesMap.get(companyId) || row.company || '')
          : (row.company || '')
      },
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {lang === 'en' ? 'Company' : 'Empresa'}
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const testimonial = row.original as any
        const companyId = testimonial.company_id
        const companyData = testimonial.companies
        const companyName = companyData?.name || companyId
          ? (companiesMap.get(companyId) || testimonial.company || '-')
          : (testimonial.company || '-')
        const logoUrl = companyData?.logo_url

        return (
          <div className="flex items-center gap-3">
            {logoUrl && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={logoUrl} alt={companyName} />
                <AvatarFallback>{companyName?.charAt(0)?.toUpperCase()}</AvatarFallback>
              </Avatar>
            )}
            <div className="font-medium">{companyName}</div>
          </div>
        )
      },
    },
    {
      id: "content",
      accessorFn: (row) => lang === 'en'
        ? (row.content_en || row.content || '')
        : (row.content_es || row.content || ''),
      header: () => <div>{lang === 'en' ? 'Content' : 'Contenido'}</div>,
      cell: ({ row }) => {
        const testimonial = row.original
        const content = lang === 'en'
          ? (testimonial.content_en || testimonial.content || '')
          : (testimonial.content_es || testimonial.content || '')
        return <div className="max-w-md truncate">{content}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const testimonial = row.original

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
                  <Link href={`/${lang}/dashboard/admin/testimonials/${testimonial.id}/edit`}>
                    <Pencil className="mr-2 size-4" />
                    {dict.dashboard.admin.crud.edit}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setDeletingId(testimonial.id)
                    setDeleteDialogOpen(true)
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 size-4 text-destructive" />
                  {dict.dashboard.admin.crud.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={deleteDialogOpen && deletingId === testimonial.id} onOpenChange={(open) => {
              setDeleteDialogOpen(open)
              if (!open) setDeletingId(null)
            }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{lang === 'en' ? 'Delete Testimonial' : 'Eliminar Testimonio'}</DialogTitle>
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
                    onClick={() => handleDelete(testimonial.id)}
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

  if (testimonials.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageSquare className="size-12" />
          </EmptyMedia>
          <EmptyTitle>{dict.dashboard.empty.testimonials.title}</EmptyTitle>
          <EmptyDescription>
            {dict.dashboard.empty.testimonials.description}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyAction>
          <Button asChild>
            <Link href={`/${lang}/dashboard/admin/testimonials/new`}>
              <Plus className="mr-1.5 size-4" />
              {lang === 'en' ? 'Create Testimonial' : 'Crear Testimonio'}
            </Link>
          </Button>
        </EmptyAction>
      </Empty>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={testimonials}
      searchKey="company"
      searchPlaceholder={lang === 'en' ? 'Filter testimonials...' : 'Filtrar testimonios...'}
      dict={dict}
      lang={lang}
    />
  )
}
