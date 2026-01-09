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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { useState, useMemo } from "react"
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
import { Code, Plus, ArrowUpDown, MoreHorizontal, Pencil, Trash2, Building2 } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface Technology {
  id: string
  name?: string
  name_es?: string
  name_en?: string
  description_es?: string
  description_en?: string
  icon?: string
  category?: string | string[] // Puede ser string (legacy) o array (nuevo)
  logo_url?: string
  website_url?: string
  order_index?: number
  technology_companies?: Array<{
    company_name: string
    logo_url?: string
  }>
}

interface TechnologiesTableProps {
  technologies: Technology[]
  dict: Dictionary
  lang: Locale
}

export function TechnologiesTable({ technologies, dict, lang }: TechnologiesTableProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [hasCompaniesFilter, setHasCompaniesFilter] = useState<string>('all')

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const supabase = createClient()

      // Eliminar relaciones con empresas primero
      const { error: deleteRelationsError } = await supabase
        .from('technology_companies')
        .delete()
        .eq('technology_id', id)

      if (deleteRelationsError) throw deleteRelationsError

      // Luego eliminar la tecnología
      const { error: deleteError } = await supabase
        .from('technologies')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      router.refresh()
      setDeleteDialogOpen(false)
      setDeletingId(null)
    } catch (error) {
      console.error('Error deleting technology:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<Technology>[] = [
    {
      id: "logo",
      header: (dict as any).technologies?.logo || (lang === 'en' ? 'Logo' : 'Logo'),
      cell: ({ row }) => {
        const technology = row.original
        const name = lang === 'en' 
          ? (technology.name_en || technology.name || '')
          : (technology.name_es || technology.name || '')
        
        if (!technology.logo_url) {
          return <span className="text-muted-foreground">-</span>
        }
        
        return (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border bg-white">
            <Image
              src={technology.logo_url}
              alt={name}
              fill
              className="object-contain p-1"
              onError={(e) => {
                // Si la imagen falla al cargar, ocultar el contenedor
                const target = e.target as HTMLImageElement
                if (target.parentElement) {
                  target.parentElement.style.display = 'none'
                }
              }}
            />
          </div>
        )
      },
    },
    {
      id: "name",
      accessorFn: (row) => lang === 'en' 
        ? (row.name_en || row.name || '')
        : (row.name_es || row.name || ''),
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {(dict as any).technologies?.name || (lang === 'en' ? 'Name' : 'Nombre')}
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const technology = row.original
        const name = lang === 'en' 
          ? (technology.name_en || technology.name || '')
          : (technology.name_es || technology.name || '')
        return (
          <div className="font-medium">{name}</div>
        )
      },
    },
    {
      id: "category",
      accessorKey: "category",
      header: (dict as any).technologies?.category || (lang === 'en' ? 'Categories' : 'Categorías'),
      cell: ({ row }) => {
        const category = row.original.category
        if (!category) return <span className="text-muted-foreground">-</span>
        
        // Manejar tanto string (legacy) como array (nuevo)
        const categoryArray = Array.isArray(category) ? category : [category]
        const categoriesDict = (dict as any).technologies?.categories || {}
        
        // Mapeo manual como fallback
        const categoryMap: Record<string, string> = {
          frontend: lang === 'es' ? 'Frontend' : 'Frontend',
          backend: lang === 'es' ? 'Backend' : 'Backend',
          database: lang === 'es' ? 'Base de Datos' : 'Database',
          servidor: lang === 'es' ? 'Servidor' : 'Server',
          storage: lang === 'es' ? 'Storage' : 'Storage',
          authentication: lang === 'es' ? 'Autenticación' : 'Authentication',
          email: lang === 'es' ? 'Correo Electrónico' : 'Email',
          repository: lang === 'es' ? 'Repositorio' : 'Repository',
          payment_gateway: lang === 'es' ? 'Pasarela de Pagos' : 'Payment Gateway',
          ai: lang === 'es' ? 'Inteligencia Artificial' : 'Artificial Intelligence',
          data_analytics: lang === 'es' ? 'Análisis de Datos' : 'Data Analytics',
          devops: lang === 'es' ? 'DevOps' : 'DevOps',
          mobile: lang === 'es' ? 'Móvil' : 'Mobile',
          cloud: lang === 'es' ? 'Cloud' : 'Cloud',
        }
        
        if (categoryArray.length === 0) {
          return <span className="text-muted-foreground">-</span>
        }
        
        return (
          <div className="flex flex-wrap gap-1">
            {categoryArray.map((cat, index) => {
              // Obtener la traducción del diccionario o del mapeo manual
              const categoryKey = String(cat)
              const categoryLabel = categoriesDict[categoryKey] || categoryMap[categoryKey] || cat
              return (
                <Badge key={index} variant="outline" className="text-xs">
                  {categoryLabel}
                </Badge>
              )
            })}
          </div>
        )
      },
    },
    {
      id: "description",
      header: (dict as any).technologies?.description || (lang === 'en' ? 'Description' : 'Descripción'),
      cell: ({ row }) => {
        const technology = row.original
        const description = lang === 'en'
          ? (technology.description_en || '')
          : (technology.description_es || '')
        return <div className="max-w-md truncate">{description}</div>
      },
    },
    {
      id: "companies",
      header: (dict as any).technologies?.companies || (lang === 'en' ? 'Companies' : 'Empresas'),
      cell: ({ row }) => {
        const companies = row.original.technology_companies || []
        
        if (companies.length === 0) {
          return <span className="text-muted-foreground text-sm">{(dict as any).technologies?.noCompanies || (lang === 'en' ? 'No companies associated' : 'No hay empresas asociadas')}</span>
        }
        
        return (
          <div className="flex flex-wrap gap-2 items-center">
            {companies.slice(0, 3).map((company, index) => (
              <div key={index} className="flex items-center gap-1.5">
                {company.logo_url && (
                  <div className="relative h-6 w-6 overflow-hidden rounded border">
                    <Image
                      src={company.logo_url}
                      alt={company.company_name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <Badge variant="secondary" className="text-xs">
                  {company.company_name}
                </Badge>
              </div>
            ))}
            {companies.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{companies.length - 3}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const technology = row.original

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
                  <Link href={`/${lang}/dashboard/admin/technologies/${technology.id}/edit`}>
                    <Pencil className="mr-2 size-4" />
                    {dict.dashboard.admin.crud.edit}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setDeletingId(technology.id)
                    setDeleteDialogOpen(true)
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 size-4 text-destructive" />
                  {dict.dashboard.admin.crud.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={deleteDialogOpen && deletingId === technology.id} onOpenChange={setDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{(dict as any).technologies?.deleteConfirm?.title || (lang === 'en' ? 'Delete technology?' : '¿Eliminar tecnología?')}</DialogTitle>
                  <DialogDescription>
                    {(dict as any).technologies?.deleteConfirm?.description || (lang === 'en' ? 'This action cannot be undone.' : 'Esta acción no se puede deshacer.')}
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
                    onClick={() => handleDelete(technology.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? dict.dashboard.admin.crud.deleting : dict.dashboard.admin.crud.delete}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )
      },
    },
  ]

  // Filtrar datos según los filtros seleccionados
  const filteredTechnologies = useMemo(() => {
    let filtered = technologies

    // Filtro por categoría (soporta tanto string como array)
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(tech => {
        if (!tech.category) return false
        const categoryArray = Array.isArray(tech.category) ? tech.category : [tech.category]
        return categoryArray.includes(categoryFilter)
      })
    }

    // Filtro por empresas (con/sin empresas)
    if (hasCompaniesFilter === 'with') {
      filtered = filtered.filter(tech => 
        tech.technology_companies && tech.technology_companies.length > 0
      )
    } else if (hasCompaniesFilter === 'without') {
      filtered = filtered.filter(tech => 
        !tech.technology_companies || tech.technology_companies.length === 0
      )
    }

    return filtered
  }, [technologies, categoryFilter, hasCompaniesFilter])

  // Obtener categorías únicas para el filtro
  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>()
    technologies.forEach(tech => {
      if (tech.category) {
        // Manejar tanto string (legacy) como array (nuevo)
        const categoryArray = Array.isArray(tech.category) ? tech.category : [tech.category]
        categoryArray.forEach(cat => {
          if (cat) categories.add(cat)
        })
      }
    })
    return Array.from(categories).sort()
  }, [technologies])

  const categories = (dict as any).technologies?.categories || {}

  if (technologies.length === 0) {
    return (
      <Empty>
        <EmptyMedia>
          <Code className="size-12 text-muted-foreground" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>
            {lang === 'en' ? 'No technologies' : 'No hay tecnologías'}
          </EmptyTitle>
          <EmptyDescription>
            {lang === 'en' 
              ? 'Get started by creating your first technology.'
              : 'Comienza creando tu primera tecnología.'}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyAction>
          <Button asChild>
            <Link href={`/${lang}/dashboard/admin/technologies/new`}>
              <Plus className="mr-2 size-4" />
              {(dict as any).technologies?.create || (lang === 'en' ? 'Create Technology' : 'Crear Tecnología')}
            </Link>
          </Button>
        </EmptyAction>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros adicionales */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-card rounded-lg">
        {/* Filtro por categoría */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <label className="text-sm text-muted-foreground whitespace-nowrap">
            {lang === 'en' ? 'Category' : 'Categoría'}:
          </label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full border-2! border-border!">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {lang === 'en' ? 'All categories' : 'Todas las categorías'}
              </SelectItem>
              {uniqueCategories.map(category => {
                const categoryKey = String(category)
                const categoryMap: Record<string, string> = {
                  frontend: lang === 'es' ? 'Frontend' : 'Frontend',
                  backend: lang === 'es' ? 'Backend' : 'Backend',
                  database: lang === 'es' ? 'Base de Datos' : 'Database',
                  servidor: lang === 'es' ? 'Servidor' : 'Server',
                  storage: lang === 'es' ? 'Storage' : 'Storage',
                  authentication: lang === 'es' ? 'Autenticación' : 'Authentication',
                  email: lang === 'es' ? 'Correo Electrónico' : 'Email',
                  repository: lang === 'es' ? 'Repositorio' : 'Repository',
                  payment_gateway: lang === 'es' ? 'Pasarela de Pagos' : 'Payment Gateway',
                  ai: lang === 'es' ? 'Inteligencia Artificial' : 'Artificial Intelligence',
                  data_analytics: lang === 'es' ? 'Análisis de Datos' : 'Data Analytics',
                  devops: lang === 'es' ? 'DevOps' : 'DevOps',
                  mobile: lang === 'es' ? 'Móvil' : 'Mobile',
                  cloud: lang === 'es' ? 'Cloud' : 'Cloud',
                }
                const categoryLabel = categories[categoryKey] || categoryMap[categoryKey] || category
                return (
                  <SelectItem key={category} value={category}>
                    {categoryLabel}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por empresas */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <label className="text-sm text-muted-foreground whitespace-nowrap">
            {lang === 'en' ? 'Companies' : 'Empresas'}:
          </label>
          <Select value={hasCompaniesFilter} onValueChange={setHasCompaniesFilter}>
            <SelectTrigger className="w-full border-2! border-border!">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {lang === 'en' ? 'All' : 'Todas'}
              </SelectItem>
              <SelectItem value="with">
                {lang === 'en' ? 'With companies' : 'Con empresas'}
              </SelectItem>
              <SelectItem value="without">
                {lang === 'en' ? 'Without companies' : 'Sin empresas'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contador de resultados */}
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {filteredTechnologies.length} {filteredTechnologies.length === 1 
            ? (lang === 'en' ? 'technology' : 'tecnología')
            : (lang === 'en' ? 'technologies' : 'tecnologías')}
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredTechnologies} 
        searchKey="name"
        searchPlaceholder={lang === 'en' ? 'Filter technologies...' : 'Filtrar tecnologías...'}
        dict={dict} 
        lang={lang} 
      />
    </div>
  )
}
