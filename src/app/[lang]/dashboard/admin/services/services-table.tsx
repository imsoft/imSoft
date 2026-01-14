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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyAction,
} from "@/components/ui/empty"
import { Briefcase, Plus, ArrowUpDown, MoreHorizontal, Pencil, Trash2, ImageIcon } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import Image from "next/image"
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { Service, ServicesTableProps } from '@/types'

export type { Service }

export function ServicesTable({ services, dict, lang }: ServicesTableProps) {
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
      const filePath = getStoragePathFromUrl(imageUrl, 'service-images')

      if (!filePath) {
        console.warn('No se pudo extraer el path de la imagen:', imageUrl)
        return
      }

      const { error } = await supabase.storage
        .from('service-images')
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

      // Primero obtener el servicio para acceder a su image_url
      const { data: service, error: fetchError } = await supabase
        .from('services')
        .select('image_url')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Eliminar la imagen del storage si existe
      if (service?.image_url) {
        await deleteImageFromStorage(service.image_url)
      }

      // Luego eliminar el registro de la base de datos
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      router.refresh()
      setDeleteDialogOpen(false)
      setDeletingId(null)
    } catch (error) {
      console.error('Error deleting service:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<Service>[] = [
    {
      id: "image",
      accessorKey: "image_url",
      header: () => <div className="text-center">{lang === 'en' ? 'Image' : 'Imagen'}</div>,
      cell: ({ row }) => {
        const imageUrl = row.original.image_url as string | null | undefined
        const service = row.original
        const title = lang === 'en' 
          ? (service.title_en || service.title || '')
          : (service.title_es || service.title || '')
        return (
          <div className="flex justify-center">
            {imageUrl ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image
                  src={imageUrl}
                  alt={title}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
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
        const service = row.original
        const title = lang === 'en' 
          ? (service.title_en || service.title || '')
          : (service.title_es || service.title || '')
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
        const service = row.original
        const description = lang === 'en'
          ? (service.description_en || service.description || '')
          : (service.description_es || service.description || '')
        return <div className="max-w-md truncate">{description}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const service = row.original

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
                  <Link href={`/${lang}/dashboard/admin/services/${service.id}/edit`}>
                    <Pencil className="mr-2 size-4" />
                    {dict.dashboard.admin.crud.edit}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setDeletingId(service.id)
                    setDeleteDialogOpen(true)
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 size-4 text-destructive" />
                  {dict.dashboard.admin.crud.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={deleteDialogOpen && deletingId === service.id} onOpenChange={(open) => {
              setDeleteDialogOpen(open)
              if (!open) setDeletingId(null)
            }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{lang === 'en' ? 'Delete Service' : 'Eliminar Servicio'}</DialogTitle>
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
                    onClick={() => handleDelete(service.id)}
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

  if (services.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Briefcase className="size-12" />
          </EmptyMedia>
          <EmptyTitle>{dict.dashboard.empty.services?.title || 'No hay servicios'}</EmptyTitle>
          <EmptyDescription>
            {dict.dashboard.empty.services?.description || 'Aún no has creado ningún servicio.'}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyAction>
          <Button asChild>
            <Link href={`/${lang}/dashboard/admin/services/new`}>
              <Plus className="mr-1.5 size-4" />
              {lang === 'en' ? 'Create Service' : 'Crear Servicio'}
            </Link>
          </Button>
        </EmptyAction>
      </Empty>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={services}
      searchKey="title"
      searchPlaceholder={lang === 'en' ? 'Filter services...' : 'Filtrar servicios...'}
      dict={dict}
      lang={lang}
    />
  )
}
