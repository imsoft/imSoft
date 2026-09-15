import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { UserMenu } from "@/components/dashboards/user-menu"
import { ClientSidebar } from "@/components/dashboards/client-sidebar"
import { getDictionary, hasLocale } from '../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ClientDashboardLayout({
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

  return (
    <SidebarProvider>
      <ClientSidebar dict={dict} lang={lang} user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <UserMenu
            lang={lang}
            email={user.email}
            name={user.user_metadata?.full_name ?? user.user_metadata?.name ?? null}
            avatarUrl={user.user_metadata?.avatar_url ?? null}
            profileHref={`/${lang}/dashboard/client/profile`}
            labels={{ profile: dict.dashboard.common.profile, logout: dict.dashboard.common.logout }}
          />
        </header>
        <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

