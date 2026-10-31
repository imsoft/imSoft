import { ISSUER } from '@/config/issuer'

/**
 * Shared quote and contract header: imSoft logo and issuer details on the left,
 * document kind and number on the right. Plain <img> (not next/image) so it looks the
 * same on screen and when printed to PDF.
 */
export function DocumentHeader({ kind, number, extra }: { kind: string; number: string; extra?: React.ReactNode }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-200 pb-6">
      <div className="max-w-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/logo-imsoft-blue.png" alt="imSoft" width={140} height={48} className="h-12 w-auto mb-3" />
        <p className="text-sm text-neutral-600">{ISSUER.name}</p>
        <p className="text-sm text-neutral-600">RFC {ISSUER.rfc} · {ISSUER.taxRegime}</p>
        <p className="text-sm text-neutral-600">{ISSUER.address}, {ISSUER.city}</p>
        <p className="text-sm text-neutral-600">{ISSUER.email} · {ISSUER.phone} · {ISSUER.website.replace('https://', '')}</p>
      </div>
      <div className="sm:text-right shrink-0">
        <p className="text-xs uppercase tracking-widest text-neutral-500">{kind}</p>
        <p className="text-xl font-semibold font-mono">{number}</p>
        {extra}
      </div>
    </header>
  )
}
