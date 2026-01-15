'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  lang: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  lang,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pageSize, setPageSize] = React.useState(10)

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageSize,
        pageIndex: 0,
      },
    },
  })

  React.useEffect(() => {
    table.setPageSize(pageSize)
  }, [pageSize, table])

  return (
    <div className="w-full">
      {/* Filtros */}
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro por Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name-filter">{lang === 'en' ? 'Name' : 'Nombre'}</Label>
            <Input
              id="name-filter"
              placeholder={lang === 'en' ? 'Search by name...' : 'Buscar por nombre...'}
              value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('name')?.setFilterValue(event.target.value)
              }
              className="border-2"
            />
          </div>

          {/* Filtro por Email */}
          <div className="space-y-2">
            <Label htmlFor="email-filter">{lang === 'en' ? 'Email' : 'Correo'}</Label>
            <Input
              id="email-filter"
              placeholder={lang === 'en' ? 'Search by email...' : 'Buscar por correo...'}
              value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('email')?.setFilterValue(event.target.value)
              }
              className="border-2"
            />
          </div>

          {/* Filtro por Empresa */}
          <div className="space-y-2">
            <Label htmlFor="company-filter">{lang === 'en' ? 'Company' : 'Empresa'}</Label>
            <Input
              id="company-filter"
              placeholder={lang === 'en' ? 'Search by company...' : 'Buscar por empresa...'}
              value={(table.getColumn('company')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('company')?.setFilterValue(event.target.value)
              }
              className="border-2"
            />
          </div>

          {/* Filtro por Estado */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">{lang === 'en' ? 'Status' : 'Estado'}</Label>
            <Select
              value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
              onValueChange={(value) =>
                table.getColumn('status')?.setFilterValue(value === 'all' ? '' : value)
              }
            >
              <SelectTrigger id="status-filter" className="border-2">
                <SelectValue placeholder={lang === 'en' ? 'All statuses' : 'Todos los estados'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === 'en' ? 'All statuses' : 'Todos los estados'}</SelectItem>
                <SelectItem value="no_contact">{lang === 'en' ? 'No Contact' : 'Sin Contacto'}</SelectItem>
                <SelectItem value="qualification">{lang === 'en' ? 'Prospecting' : 'Prospección'}</SelectItem>
                <SelectItem value="negotiation">{lang === 'en' ? 'Negotiation' : 'Negociación'}</SelectItem>
                <SelectItem value="closed_won">{lang === 'en' ? 'Won' : 'Ganado'}</SelectItem>
                <SelectItem value="closed_lost">{lang === 'en' ? 'Lost' : 'Perdido'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtro por Tipo */}
          <div className="space-y-2">
            <Label htmlFor="type-filter">{lang === 'en' ? 'Type' : 'Tipo'}</Label>
            <Select
              value={(table.getColumn('contact_type')?.getFilterValue() as string) ?? 'all'}
              onValueChange={(value) =>
                table.getColumn('contact_type')?.setFilterValue(value === 'all' ? '' : value)
              }
            >
              <SelectTrigger id="type-filter" className="border-2">
                <SelectValue placeholder={lang === 'en' ? 'All types' : 'Todos los tipos'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === 'en' ? 'All types' : 'Todos los tipos'}</SelectItem>
                <SelectItem value="lead">{lang === 'en' ? 'Lead' : 'Lead'}</SelectItem>
                <SelectItem value="prospect">{lang === 'en' ? 'Prospect' : 'Prospecto'}</SelectItem>
                <SelectItem value="customer">{lang === 'en' ? 'Customer' : 'Cliente'}</SelectItem>
                <SelectItem value="partner">{lang === 'en' ? 'Partner' : 'Socio'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botón de Columnas */}
          <div className="flex items-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  {lang === 'en' ? 'Columns' : 'Columnas'} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {lang === 'en' ? 'No results.' : 'Sin resultados.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {lang === 'en' ? 'Rows per page:' : 'Filas por página:'}
          </span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px] border-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            {lang === 'en' ? 'of' : 'de'} {table.getFilteredRowModel().rows.length}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {lang === 'en' ? 'Previous' : 'Anterior'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {lang === 'en' ? 'Next' : 'Siguiente'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
