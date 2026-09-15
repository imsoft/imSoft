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
  Users,
  PanelsTopLeft,
  Settings,
  BarChart3,
  FileText,
  Briefcase,
  FolderOpen,
  BookOpen,
  MessageSquare,
  Contact,
  Building2,
  UserCog,
  Code,
  Mail, Calculator, FileSignature } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "@/components/ui/image"
import { useSidebar } from "@/components/ui/sidebar"
import type { AdminSidebarProps } from '@/types/dashboard'

export function AdminSidebar({ dict, lang }: AdminSidebarProps) {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const menuItems = [
    {
      title: dict.dashboard.admin.nav.overview,
      url: `/${lang}/dashboard/admin`,
      icon: LayoutDashboard,
    },
    {
      title: dict.dashboard.admin.nav.users,
      url: `/${lang}/dashboard/admin/users`,
      icon: Users,
    },
    {
      title: dict.dashboard.admin.nav.companies,
      url: `/${lang}/dashboard/admin/companies`,
      icon: Building2,
    },
    {
      title: dict.dashboard.admin.nav.projects,
      url: `/${lang}/dashboard/admin/projects`,
      icon: PanelsTopLeft,
    },
    {
      title: dict.dashboard.admin.nav.services,
      url: `/${lang}/dashboard/admin/services`,
      icon: Briefcase,
    },
    {
      title: dict.dashboard.admin.nav.portfolio,
      url: `/${lang}/dashboard/admin/portfolio`,
      icon: FolderOpen,
    },
    {
      title: dict.dashboard.admin.nav.blog,
      url: `/${lang}/dashboard/admin/blog`,
      icon: BookOpen,
    },
    {
      title: dict.dashboard.admin.nav.testimonials,
      url: `/${lang}/dashboard/admin/testimonials`,
      icon: MessageSquare,
    },
    {
      title: dict.dashboard.admin.nav.contact,
      url: `/${lang}/dashboard/admin/contact`,
      icon: Contact,
    },
    {
      title: dict.dashboard.admin.nav.contactMessages,
      url: `/${lang}/dashboard/admin/contact-messages`,
      icon: Mail,
    },
{
      title: dict.dashboard.admin.nav.feedbacks,
      url: `/${lang}/dashboard/admin/feedbacks`,
      icon: MessageSquare,
    },
    {
      title: dict.dashboard.admin.nav.crm,
      url: `/${lang}/dashboard/admin/crm`,
      icon: UserCog,
    },
    {
      title: dict.dashboard.admin.nav.technologies,
      url: `/${lang}/dashboard/admin/technologies`,
      icon: Code,
    },
    {
      title: dict.dashboard.admin.nav.analytics,
      url: `/${lang}/dashboard/admin/analytics`,
      icon: BarChart3,
    },
    {
      title: dict.dashboard.admin.nav.reports,
      url: `/${lang}/dashboard/admin/reports`,
      icon: FileText,
    },
    {
      title: dict.dashboard.admin.nav.cotizaciones,
      url: `/${lang}/dashboard/admin/cotizaciones`,
      icon: FileSignature,
    },
    {
      title: dict.dashboard.admin.nav.simulador,
      url: `/${lang}/dashboard/admin/simulador`,
      icon: Calculator,
    },
    {
      title: dict.dashboard.admin.nav.settings,
      url: `/${lang}/dashboard/admin/settings`,
      icon: Settings,
    },
  ]


  // Función para verificar si una ruta está activa
  // Compara si el pathname actual coincide exactamente o comienza con la URL del item
  const isRouteActive = (itemUrl: string) => {
    // Si es la ruta overview (/dashboard/admin), solo activar si coincide exactamente
    if (itemUrl === `/${lang}/dashboard/admin`) {
      return pathname === itemUrl
    }
    // Para otras rutas, activar si el pathname coincide exactamente
    // o si comienza con la URL del item seguida de "/"
    // Esto evita que /contact se active cuando estamos en /contact-messages
    return pathname === itemUrl || pathname.startsWith(itemUrl + '/')
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="imSoft">
              <Link href={`/${lang}/dashboard/admin`}>
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

