import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminCompaniesTable } from './companies-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminCompaniesPage({ params }: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect(`/${lang}/login`)
  }

  // Verificar que sea admin
  if (user.user_metadata?.role !== 'admin') {
    redirect(`/${lang}/dashboard/client`)
  }

  // Obtener todas las empresas (con y sin usuario)
  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching companies:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    // Si es un error de tabla no encontrada, mostrar mensaje más claro
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      console.error('La tabla "companies" no existe. Por favor, ejecuta el script create-companies-table.sql en Supabase.')
    }
    // Si es un error de permisos (RLS), mostrar mensaje más claro
    if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('new row violates row-level security')) {
      console.error('Error de permisos RLS. Por favor, ejecuta el script fix-companies-rls-for-admin.sql en Supabase.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dict.dashboard.admin.nav.companies}</h1>
          <p className="text-muted-foreground">
            {lang === 'en' 
              ? 'Manage all companies. You can create companies without users for existing projects.'
              : 'Gestiona todas las empresas. Puedes crear empresas sin usuarios para proyectos existentes.'}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${lang}/dashboard/admin/companies/new`}>
            <Plus className="mr-1.5 size-4" />
            {dict.companies.create}
          </Link>
        </Button>
      </div>
      <AdminCompaniesTable companies={companies || []} dict={dict} lang={lang} />
    </div>
  )
}

