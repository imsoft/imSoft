'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  PanelsTopLeft,
  Building2,
  MessageSquare,
  Inbox,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "@/components/ui/image"
import { useSidebar } from "@/components/ui/sidebar"
import type { ClientSidebarProps } from '@/types/dashboard'

export function ClientSidebar({ dict, lang }: ClientSidebarProps) {
  const pathname = usePathname()
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
      title: dict.dashboard.client.nav.feedback,
      url: `/${lang}/dashboard/client/feedback`,
      icon: MessageSquare,
    },
    {
      title: dict.dashboard.client.nav.messages,
      url: `/${lang}/dashboard/client/messages`,
      icon: Inbox,
    },
    {
      title: dict.dashboard.client.nav.billing,
      url: `/${lang}/dashboard/client/billing`,
      icon: CreditCard,
    },
  ]


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
                  isCollapsed ? 'size-14 p-2.5' : 'size-8 p-1.5'
                }`}>
                  <Image
                    src="/logos/isotype-imsoft-blue.png"
                    alt="imSoft"
                    width={isCollapsed ? 40 : 20}
                    height={isCollapsed ? 40 : 20}
                    className="dark:hidden object-contain"
                  />
                  <Image
                    src="/logos/isotype-imsoft-white.png"
                    alt="imSoft"
                    width={isCollapsed ? 40 : 20}
                    height={isCollapsed ? 40 : 20}
                    className="hidden dark:block object-contain"
                  />
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
    </Sidebar>
  )
}

