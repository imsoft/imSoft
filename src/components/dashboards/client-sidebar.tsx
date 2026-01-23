'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  LayoutDashboard, 
  PanelsTopLeft, 
  User, 
  LogOut,
  Building2,
  Receipt,
  MessageSquare
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useSidebar } from "@/components/ui/sidebar"
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { ClientSidebarProps } from '@/types/dashboard'

export function ClientSidebar({ dict, lang, user }: ClientSidebarProps) {
  const avatarUrl = user.user_metadata?.avatar_url
  const pathname = usePathname()
  const router = useRouter()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const menuItems = [
    {
      title: dict.dashboard.client.nav.overview,
      url: `/${lang}/dashboard/client`,
      icon: LayoutDashboard,
    },
    {
      title: dict.dashboard.client.nav.myProjects,
      url: `/${lang}/dashboard/client/projects`,
      icon: PanelsTopLeft,
    },
    {
      title: dict.dashboard.client.nav.companies,
      url: `/${lang}/dashboard/client/companies`,
      icon: Building2,
    },
    {
      title: dict.dashboard.client.nav.quotations,
      url: `/${lang}/dashboard/client/quotations`,
      icon: Receipt,
    },
    {
      title: dict.dashboard.client.nav.feedback,
      url: `/${lang}/dashboard/client/feedback`,
      icon: MessageSquare,
    },
  ]

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${lang}/login`)
    router.refresh()
  }

  // Función para verificar si una ruta está activa
  // Compara si el pathname actual coincide exactamente o comienza con la URL del item
  const isRouteActive = (itemUrl: string) => {
    // Si es la ruta overview (/dashboard/client), solo activar si coincide exactamente
    if (itemUrl === `/${lang}/dashboard/client`) {
      return pathname === itemUrl
    }
    // Para otras rutas, activar si el pathname comienza con la URL del item
    return pathname.startsWith(itemUrl)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="imSoft">
              <Link href={`/${lang}/dashboard/client`}>
                <div className={`flex aspect-square items-center justify-center rounded-lg overflow-hidden ${
                  isCollapsed ? 'size-10 p-2' : 'size-8 p-1.5'
                }`}>
                  <Image
                    src="/logos/isotype-imsoft-blue.png"
                    alt="imSoft"
                    width={isCollapsed ? 28 : 20}
                    height={isCollapsed ? 28 : 20}
                    className="dark:hidden object-contain"
                  />
                  <Image
                    src="/logos/isotype-imsoft-white.png"
                    alt="imSoft"
                    width={isCollapsed ? 28 : 20}
                    height={isCollapsed ? 28 : 20}
                    className="hidden dark:block object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">imSoft</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isRouteActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip={dict.dashboard.common.profile}>
              <Link href={`/${lang}/dashboard/client/profile`}>
                {avatarUrl ? (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full overflow-hidden border border-sidebar-border">
                    <Image
                      src={avatarUrl}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="object-cover rounded-full"
                    />
                  </div>
                ) : (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                    <User className="size-4" />
                  </div>
                )}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{dict.dashboard.common.profile}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              onClick={handleLogout} 
              tooltip={dict.dashboard.common.logout}
              className="hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 justify-center"
            >
              <LogOut className="size-4" />
              <span className="group-data-[collapsible=icon]:hidden">{dict.dashboard.common.logout}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

