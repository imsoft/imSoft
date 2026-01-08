import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/dashboards/admin-sidebar"
import { getDictionary, hasLocale } from '../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const supabase = await createClient()
  
  // Verificar autenticación
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect(`/${lang}/login`)
  }

  // Verificar que el usuario tenga rol de administrador
  const userRole = user.user_metadata?.role || 'client'
  
  if (userRole !== 'admin') {
    // Si no es admin, redirigir al dashboard de cliente
    redirect(`/${lang}/dashboard/client`)
  }

  return (
    <SidebarProvider>
      <AdminSidebar dict={dict} lang={lang} user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

