'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CHANNEL_LABEL, type Channel, type QueueRow } from '@/lib/social-message'
import { SocialMessageDialog } from './social-message-dialog'

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

interface Props {
  lang: string
  rows: QueueRow[]
  total: number
}

/**
 * Today's social queue: uncontacted prospects with WhatsApp or Instagram. Each button
 * opens the message on that channel; marking "Ya lo envié" takes the contact off the list.
 */
export function SocialQueue({ lang, rows, total }: Props) {
  const es = lang !== 'en'
  const [open, setOpen] = useState<{ row: QueueRow; channel: Channel } | null>(null)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-baseline justify-between gap-2 text-base">
          <span>{es ? 'Cola de hoy por redes' : "Today's social queue"}</span>
          <span className="text-sm font-normal text-muted-foreground tabular-nums">{total} {es ? 'sin contactar con WhatsApp o Instagram' : 'uncontacted with WhatsApp or Instagram'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{es ? 'No hay prospectos sin contactar con WhatsApp o Instagram. Agrega redes o teléfono en sus fichas, o busca prospectos nuevos.' : 'No uncontacted prospects with WhatsApp or Instagram.'}</p>
        ) : (
          <ul className="divide-y">
            {rows.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center gap-2 py-2">
                <div className="min-w-0 flex-1">
                  <Link href={`/${lang}/dashboard/admin/crm/contacts/${f.id}`} className="truncate font-medium hover:underline">{f.company || f.name || '—'}</Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {f.company && f.name ? f.name : ''}
                    {f.noEmail && <Badge variant="outline" className="ml-2 align-middle text-[10px]">{es ? 'sin correo' : 'no email'}</Badge>}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {f.channels.map((c) => (
                    <Button key={c} size="sm" variant="outline" onClick={() => setOpen({ row: f, channel: c })} title={`${es ? 'Mensaje por' : 'Message on'} ${CHANNEL_LABEL[c]}`}>
                      {c === 'instagram' ? <Instagram className="mr-1.5 h-3.5 w-3.5" /> : <MessageCircle className="mr-1.5 h-3.5 w-3.5" />}
                      {CHANNEL_LABEL[c]}
                    </Button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
        {total > rows.length && <p className="pt-2 text-xs text-muted-foreground">{es ? `Se muestran ${rows.length} de ${total}. Los demás aparecen conforme avanzas.` : `Showing ${rows.length} of ${total}.`}</p>}
        {open && (
          <SocialMessageDialog
            contact={{ id: open.row.id, name: open.row.name || open.row.company, social_links: open.row.contact.social_links, instagram_url: open.row.contact.instagram_url, phone: open.row.contact.phone }}
            lang={lang}
            open
            initialChannel={open.channel}
            onClose={() => setOpen(null)}
          />
        )}
      </CardContent>
    </Card>
  )
}
