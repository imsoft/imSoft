import { demoWhatsAppHref, type DemoSlug } from '@/lib/demo-sites'

/** Thin bar above every sample site: says it's an example and links to imSoft. */
export function DemoRibbon({ slug }: { slug: DemoSlug }) {
  return (
    <div className="relative z-50 bg-[#0b1220] text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-[13px] leading-snug">
        <span className="opacity-80">Página de ejemplo para un negocio ficticio, hecha por imSoft.</span>
        <a
          href={demoWhatsAppHref(slug)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#5cc8ff] underline-offset-4 hover:underline"
        >
          Quiero una así para mi negocio →
        </a>
      </div>
    </div>
  )
}
