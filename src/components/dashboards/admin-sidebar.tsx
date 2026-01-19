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
  Users,
  PanelsTopLeft,
  Settings,
  BarChart3,
  FileText,
  LogOut,
  User,
  Briefcase,
  FolderOpen,
  BookOpen,
  MessageSquare,
  Contact,
  Building2,
  Receipt,
  UserCog,
  Code,
  Mail
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { AdminSidebarProps } from '@/types/dashboard'

export function AdminSidebar({ dict, lang, user }: AdminSidebarProps) {
  const avatarUrl = user.user_metadata?.avatar_url
  const pathname = usePathname()
  const router = useRouter()

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
      title: dict.dashboard.admin.nav.quotations,
      url: `/${lang}/dashboard/admin/quotations`,
      icon: Receipt,
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
      title: dict.dashboard.admin.nav.settings,
      url: `/${lang}/dashboard/admin/settings`,
      icon: Settings,
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
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden p-1.5">
                  <Image
                    src="/logos/isotype-imsoft-blue.png"
                    alt="imSoft"
                    width={20}
                    height={20}
                    className="dark:hidden object-contain"
                  />
                  <Image
                    src="/logos/isotype-imsoft-white.png"
                    alt="imSoft"
                    width={20}
                    height={20}
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
              <Link href={`/${lang}/dashboard/admin/profile`}>
                {avatarUrl ? (
                  <div className="flex aspect-square size-8 items-center justify-center rounded-full overflow-hidden border border-sidebar-border">
                    <Image
                      src={avatarUrl}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
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
            <SidebarMenuButton size="lg" onClick={handleLogout} tooltip={dict.dashboard.common.logout}>
              <LogOut className="size-4" />
              <span>{dict.dashboard.common.logout}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

