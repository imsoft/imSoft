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
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyAction,
} from "@/components/ui/empty"
import { FolderOpen, Plus } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { PortfolioItem, PortfolioTableProps } from '@/types'

export type { PortfolioItem }

export function PortfolioTable({ portfolio, dict, lang }: PortfolioTableProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Función helper para extraer el path del storage desde la URL pública
  function getStoragePathFromUrl(url: string, bucketName: string): string | null {
    try {
      const urlParts = url.split(`/storage/v1/object/public/${bucketName}/`)
      return urlParts[1] || null
    } catch {
      return null
    }
  }

  // Función para eliminar imagen del storage
  async function deleteImageFromStorage(imageUrl: string) {
    try {
      const supabase = createClient()
      const filePath = getStoragePathFromUrl(imageUrl, 'portfolio-images')

      if (!filePath) {
        console.warn('No se pudo extraer el path de la imagen:', imageUrl)
        return
      }

      const { error } = await supabase.storage
        .from('portfolio-images')
        .remove([filePath])

      if (error) {
        console.error('Error al eliminar imagen del storage:', error)
      }
    } catch (error) {
      console.error('Error al eliminar imagen:', error)
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const supabase = createClient()

      // Primero obtener el item para acceder a su image_url
      const { data: item, error: fetchError } = await supabase
        .from('portfolio')
        .select('image_url')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Eliminar la imagen del storage si existe
      if (item?.image_url) {
        await deleteImageFromStorage(item.image_url)
      }

      // Luego eliminar el registro de la base de datos
      const { error: deleteError } = await supabase
        .from('portfolio')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      router.refresh()
      setDeleteDialogOpen(false)
      setDeletingId(null)
    } catch (error) {
      console.error('Error deleting portfolio item:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<PortfolioItem>[] = [
    {
      accessorKey: "image_url",
      header: () => <div>{lang === 'en' ? 'Image' : 'Imagen'}</div>,
      cell: ({ row }) => {
        const imageUrl = row.getValue("image_url") as string
        const item = row.original
        const title = lang === 'en'
          ? (item.title_en || item.title || '')
          : (item.title_es || item.title || '')

        return imageUrl ? (
          <div className="relative w-16 h-16 rounded-md overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">
              {lang === 'en' ? 'No image' : 'Sin imagen'}
            </span>
          </div>
        )
      },
    },
    {
      id: "title",
      accessorFn: (row) => lang === 'en'
        ? (row.title_en || row.title || '')
        : (row.title_es || row.title || ''),
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {lang === 'en' ? 'Title' : 'Título'}
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const item = row.original
        const title = lang === 'en'
          ? (item.title_en || item.title || '')
          : (item.title_es || item.title || '')
        return <div className="font-medium">{title}</div>
      },
    },
    {
      id: "description",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {lang === 'en' ? 'Description' : 'Descripción'}
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const item = row.original
        const description = lang === 'en'
          ? (item.description_en || item.description || '')
          : (item.description_es || item.description || '')
        return <div className="max-w-md truncate">{description}</div>
      },
    },
    {
      accessorKey: "project_url",
      header: () => <div>{lang === 'en' ? 'URL' : 'URL'}</div>,
      cell: ({ row }) => {
        const url = row.getValue("project_url") as string
        return url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {lang === 'en' ? 'View' : 'Ver'}
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original

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
                  <Link href={`/${lang}/dashboard/admin/portfolio/${item.id}/edit`}>
                    <Pencil className="mr-2 size-4" />
                    {dict.dashboard.admin.crud.edit}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setDeletingId(item.id)
                    setDeleteDialogOpen(true)
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 size-4 text-destructive" />
                  {dict.dashboard.admin.crud.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={deleteDialogOpen && deletingId === item.id} onOpenChange={(open) => {
              setDeleteDialogOpen(open)
              if (!open) setDeletingId(null)
            }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{lang === 'en' ? 'Delete Portfolio Item' : 'Eliminar Proyecto'}</DialogTitle>
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
                    onClick={() => handleDelete(item.id)}
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

  if (portfolio.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderOpen className="size-12" />
          </EmptyMedia>
          <EmptyTitle>{dict.dashboard.empty.portfolio.title}</EmptyTitle>
          <EmptyDescription>
            {dict.dashboard.empty.portfolio.description}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyAction>
          <Button asChild>
            <Link href={`/${lang}/dashboard/admin/portfolio/new`}>
              <Plus className="mr-1.5 size-4" />
              {lang === 'en' ? 'Create Portfolio Item' : 'Crear Proyecto de Portafolio'}
            </Link>
          </Button>
        </EmptyAction>
      </Empty>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={portfolio}
      searchKey="title"
      searchPlaceholder={lang === 'en' ? 'Filter projects...' : 'Filtrar proyectos...'}
      dict={dict}
      lang={lang}
    />
  )
}
