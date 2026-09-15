'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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

  const base = `/${lang}/dashboard/admin`
  const nav = dict.dashboard.admin.nav
  const g = nav.groups

  // Agrupado por flujo de trabajo: vender, atender clientes, mantener el sitio, medir.
  const grupos: { label: string | null; items: { title: string; url: string; icon: typeof Users }[] }[] = [
    {
      label: null,
      items: [{ title: nav.overview, url: base, icon: LayoutDashboard }],
    },
    {
      label: g.sales,
      items: [
        { title: nav.crm, url: `${base}/crm`, icon: UserCog },
        { title: nav.cotizaciones, url: `${base}/cotizaciones`, icon: FileSignature },
        { title: nav.simulador, url: `${base}/simulador`, icon: Calculator },
        { title: nav.contactMessages, url: `${base}/contact-messages`, icon: Mail },
      ],
    },
    {
      label: g.clients,
      items: [
        { title: nav.projects, url: `${base}/projects`, icon: PanelsTopLeft },
        { title: nav.companies, url: `${base}/companies`, icon: Building2 },
        { title: nav.users, url: `${base}/users`, icon: Users },
        { title: nav.feedbacks, url: `${base}/feedbacks`, icon: MessageSquare },
      ],
    },
    {
      label: g.website,
      items: [
        { title: nav.services, url: `${base}/services`, icon: Briefcase },
        { title: nav.portfolio, url: `${base}/portfolio`, icon: FolderOpen },
        { title: nav.blog, url: `${base}/blog`, icon: BookOpen },
        { title: nav.testimonials, url: `${base}/testimonials`, icon: MessageSquare },
        { title: nav.technologies, url: `${base}/technologies`, icon: Code },
        { title: nav.contact, url: `${base}/contact`, icon: Contact },
      ],
    },
    {
      label: g.insights,
      items: [
        { title: nav.analytics, url: `${base}/analytics`, icon: BarChart3 },
        { title: nav.reports, url: `${base}/reports`, icon: FileText },
      ],
    },
    {
      label: null,
      items: [{ title: nav.settings, url: `${base}/settings`, icon: Settings }],
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
        {grupos.map((grupo, i) => (
          <SidebarGroup key={grupo.label ?? i} className={grupo.label ? '' : 'py-1'}>
            {grupo.label && !isCollapsed && <SidebarGroupLabel>{grupo.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {grupo.items.map((item) => (
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
        ))}
      </SidebarContent>
    </Sidebar>
  )
}

