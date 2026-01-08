'use client'

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, CheckSquare } from "lucide-react"
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyAction,
} from "@/components/ui/empty"
import { PanelsTopLeft, Plus } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { Project } from '@/types/database'

interface ProjectsTableProps {
  projects: Project[]
  dict: Dictionary
  lang: Locale
}

export function ProjectsTable({ projects, dict, lang }: ProjectsTableProps) {
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
      const filePath = getStoragePathFromUrl(imageUrl, 'project-images')

      if (!filePath) {
        console.warn('No se pudo extraer el path de la imagen:', imageUrl)
        return
      }

      const { error } = await supabase.storage
        .from('project-images')
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

      // Primero obtener el proyecto para acceder a su image_url
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('image_url')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Eliminar la imagen del storage si existe
      if (project?.image_url) {
        await deleteImageFromStorage(project.image_url)
      }

      // Luego eliminar el registro de la base de datos
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      router.refresh()
      setDeleteDialogOpen(false)
      setDeletingId(null)
    } catch (error) {
      console.error('Error deleting project:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<Project>[] = [
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
        const project = row.original
        const title = lang === 'en'
          ? (project.title_en || project.title || '')
          : (project.title_es || project.title || '')
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
        const project = row.original
        const description = lang === 'en'
          ? (project.description_en || project.description || '')
          : (project.description_es || project.description || '')
        return <div className="max-w-md truncate">{description}</div>
      },
    },
    {
      accessorKey: "status",
      header: () => <div>{lang === 'en' ? 'Status' : 'Estado'}</div>,
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const statusLabels: Record<string, { es: string; en: string }> = {
          planning: { es: 'Planificación', en: 'Planning' },
          'in-progress': { es: 'En Progreso', en: 'In Progress' },
          'on-hold': { es: 'En Pausa', en: 'On Hold' },
          completed: { es: 'Completado', en: 'Completed' },
          cancelled: { es: 'Cancelado', en: 'Cancelled' },
        }
        const label = statusLabels[status]?.[lang] || status
        return <div className="capitalize">{label}</div>
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
        const project = row.original

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
                  <Link href={`/${lang}/dashboard/admin/projects/${project.id}/edit`}>
                    <Pencil className="mr-2 size-4" />
                    {dict.dashboard.admin.crud.edit}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${lang}/dashboard/admin/projects/${project.id}/tasks`}>
                    <CheckSquare className="mr-2 size-4" />
                    {lang === 'en' ? 'Manage Tasks' : 'Gestionar Tareas'}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setDeletingId(project.id)
                    setDeleteDialogOpen(true)
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 size-4 text-destructive" />
                  {dict.dashboard.admin.crud.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={deleteDialogOpen && deletingId === project.id} onOpenChange={(open) => {
              setDeleteDialogOpen(open)
              if (!open) setDeletingId(null)
            }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{lang === 'en' ? 'Delete Project' : 'Eliminar Proyecto'}</DialogTitle>
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
                    onClick={() => handleDelete(project.id)}
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

  if (projects.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PanelsTopLeft className="size-12" />
          </EmptyMedia>
          <EmptyTitle>{dict.dashboard.empty.projects.title}</EmptyTitle>
          <EmptyDescription>
            {dict.dashboard.empty.projects.description}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyAction>
          <Button asChild>
            <Link href={`/${lang}/dashboard/admin/projects/new`}>
              <Plus className="mr-1.5 size-4" />
              {lang === 'en' ? 'Create Project' : 'Crear Proyecto'}
            </Link>
          </Button>
        </EmptyAction>
      </Empty>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={projects}
      searchKey="title"
      searchPlaceholder={lang === 'en' ? 'Filter projects...' : 'Filtrar proyectos...'}
      dict={dict}
      lang={lang}
    />
  )
}

