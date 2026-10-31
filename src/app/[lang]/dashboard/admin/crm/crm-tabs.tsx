import Link from 'next/link'
import { cn } from '@/lib/utils'

/** CRM tabs: contacts and prospecting live under the same section. */
export function CrmTabs({ lang, active }: { lang: string; active: 'contacts' | 'prospecting' | 'search' }) {
  const tabs = [
    { key: 'contacts', href: `/${lang}/dashboard/admin/crm`, label: lang === 'en' ? 'Contacts' : 'Contactos' },
    { key: 'prospecting', href: `/${lang}/dashboard/admin/crm/prospeccion`, label: lang === 'en' ? 'Outreach' : 'Prospección' },
    { key: 'search', href: `/${lang}/dashboard/admin/crm/buscar`, label: lang === 'en' ? 'Find prospects' : 'Buscar prospectos' },
  ] as const
  return (
    <nav className="flex gap-1 border-b">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={cn(
            '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
            t.key === active ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  )
}
