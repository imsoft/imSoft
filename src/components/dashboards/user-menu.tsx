'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Image from '@/components/ui/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UserMenuProps {
  lang: string
  email?: string | null
  name?: string | null
  avatarUrl?: string | null
  profileHref: string
  labels: { profile: string; logout: string }
}

/** Avatar arriba a la derecha con Perfil y Cerrar sesion, al estilo de las apps de Google. */
export function UserMenu({ lang, email, name, avatarUrl, profileHref, labels }: UserMenuProps) {
  const router = useRouter()
  const inicial = (name || email || '?').trim().charAt(0).toUpperCase()

  async function cerrarSesion() {
    await createClient().auth.signOut()
    router.push(`/${lang}/login`)
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={labels.profile}>
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" width={32} height={32} className="size-8 rounded-full object-cover" />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">{inicial}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          {name && <p className="text-sm font-medium truncate">{name}</p>}
          {email && <p className="text-xs text-muted-foreground truncate">{email}</p>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={profileHref}><User className="size-4" />{labels.profile}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={cerrarSesion} className="text-red-600 focus:text-red-600">
          <LogOut className="size-4" />{labels.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
