'use client'

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Plus, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
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
import { BookOpen } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { BlogPost, BlogTableProps } from '@/types'

export type { BlogPost }

interface BlogTableWithAuthorsProps extends BlogTableProps {
  authorsMap?: Map<string, string>
}

export function BlogTable({ posts, authorsMap, dict, lang }: BlogTableWithAuthorsProps) {
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
      const filePath = getStoragePathFromUrl(imageUrl, 'blog-images')

      if (!filePath) {
        console.warn('No se pudo extraer el path de la imagen:', imageUrl)
        return
      }

      const { error } = await supabase.storage
        .from('blog-images')
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

      // Primero obtener el post para acceder a su image_url
      const { data: post, error: fetchError } = await supabase
        .from('blog')
        .select('image_url')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Eliminar la imagen del storage si existe
      if (post?.image_url) {
        await deleteImageFromStorage(post.image_url)
      }

      // Luego eliminar el registro de la base de datos
      const { error: deleteError } = await supabase
        .from('blog')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      router.refresh()
      setDeleteDialogOpen(false)
      setDeletingId(null)
    } catch (error) {
      console.error('Error deleting blog post:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<BlogPost>[] = [
    {
      id: "image",
      accessorKey: "image_url",
      header: () => <div className="text-center">{lang === 'en' ? 'Image' : 'Imagen'}</div>,
      cell: ({ row }) => {
        const imageUrl = row.original.image_url as string | null | undefined
        const post = row.original
        const title = lang === 'en'
          ? (post.title_en || post.title || '')
          : (post.title_es || post.title || '')
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
        const post = row.original
        const title = lang === 'en'
          ? (post.title_en || post.title || '')
          : (post.title_es || post.title || '')
        return <div className="font-medium">{title}</div>
      },
    },
    {
      id: "excerpt",
      header: () => <div>{lang === 'en' ? 'Excerpt' : 'Resumen'}</div>,
      cell: ({ row }) => {
        const post = row.original
        const excerpt = lang === 'en'
          ? (post.excerpt_en || post.excerpt || '')
          : (post.excerpt_es || post.excerpt || '')
        const content = lang === 'en'
          ? (post.content_en || post.content || '')
          : (post.content_es || post.content || '')
        return (
          <div className="max-w-md truncate">{excerpt || content.substring(0, 100)}</div>
        )
      },
    },
    {
      accessorKey: "published",
      header: () => <div>{lang === 'en' ? 'Status' : 'Estado'}</div>,
      cell: ({ row }) => {
        const published = row.getValue("published") as boolean
        return (
          <span className={`px-2 py-1 rounded text-xs ${published ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>
            {published ? (lang === 'en' ? 'Published' : 'Publicado') : (lang === 'en' ? 'Draft' : 'Borrador')}
          </span>
        )
      },
    },
    {
      id: "author",
      accessorFn: (row) => row.author_id || '',
      header: () => <div>{lang === 'en' ? 'Author' : 'Autor'}</div>,
      cell: ({ row }) => {
        const authorId = row.original.author_id as string | undefined
        const authorName = authorId && authorsMap ? authorsMap.get(authorId) : null
        return (
          <div className="text-sm">
            {authorName || (authorId ? authorId.substring(0, 8) + '...' : '-')}
          </div>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const post = row.original

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
                  <Link href={`/${lang}/dashboard/admin/blog/${post.id}/edit`}>
                    <Pencil className="mr-2 size-4" />
                    {dict.dashboard.admin.crud.edit}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setDeletingId(post.id)
                    setDeleteDialogOpen(true)
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 size-4 text-destructive" />
                  {dict.dashboard.admin.crud.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={deleteDialogOpen && deletingId === post.id} onOpenChange={(open) => {
              setDeleteDialogOpen(open)
              if (!open) setDeletingId(null)
            }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{lang === 'en' ? 'Delete Blog Post' : 'Eliminar Publicación'}</DialogTitle>
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
                    onClick={() => handleDelete(post.id)}
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

  if (posts.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookOpen className="size-12" />
          </EmptyMedia>
          <EmptyTitle>{dict.dashboard.empty.blog.title}</EmptyTitle>
          <EmptyDescription>
            {dict.dashboard.empty.blog.description}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyAction>
          <Button asChild>
            <Link href={`/${lang}/dashboard/admin/blog/new`}>
              <Plus className="mr-1.5 size-4" />
              {lang === 'en' ? 'Create Blog Post' : 'Crear Publicación'}
            </Link>
          </Button>
        </EmptyAction>
      </Empty>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={posts}
      searchKey="title"
      searchPlaceholder={lang === 'en' ? 'Filter posts...' : 'Filtrar publicaciones...'}
      dict={dict}
      lang={lang}
    />
  )
}
