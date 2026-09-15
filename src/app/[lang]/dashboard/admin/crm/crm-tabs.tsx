import Link from 'next/link'
import { cn } from '@/lib/utils'

/** Pestañas del CRM: contactos y prospección viven bajo la misma sección. */
export function CrmTabs({ lang, activa }: { lang: string; activa: 'contactos' | 'prospeccion' | 'buscar' }) {
  const tabs = [
    { key: 'contactos', href: `/${lang}/dashboard/admin/crm`, label: lang === 'en' ? 'Contacts' : 'Contactos' },
    { key: 'prospeccion', href: `/${lang}/dashboard/admin/crm/prospeccion`, label: lang === 'en' ? 'Outreach' : 'Prospección' },
    { key: 'buscar', href: `/${lang}/dashboard/admin/crm/buscar`, label: lang === 'en' ? 'Find prospects' : 'Buscar prospectos' },
  ] as const
  return (
    <nav className="flex gap-1 border-b">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={cn(
            '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
            t.key === activa ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  )
}
