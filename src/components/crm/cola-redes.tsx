'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ETIQUETA_CANAL, type Canal, type FilaCola } from '@/lib/mensaje-red'
import { MensajeRedDialog } from './mensaje-red-dialog'

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

interface Props {
  lang: string
  filas: FilaCola[]
  total: number
}

/**
 * Cola de hoy por redes: prospectos sin contactar con WhatsApp o Instagram. Cada boton
 * abre el mensaje ya en ese canal; al marcar "Ya lo envie" el contacto sale de la lista.
 */
export function ColaRedes({ lang, filas, total }: Props) {
  const es = lang !== 'en'
  const [abierto, setAbierto] = useState<{ fila: FilaCola; canal: Canal } | null>(null)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-baseline justify-between gap-2 text-base">
          <span>{es ? 'Cola de hoy por redes' : "Today's social queue"}</span>
          <span className="text-sm font-normal text-muted-foreground tabular-nums">{total} {es ? 'sin contactar con WhatsApp o Instagram' : 'uncontacted with WhatsApp or Instagram'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filas.length === 0 ? (
          <p className="text-sm text-muted-foreground">{es ? 'No hay prospectos sin contactar con WhatsApp o Instagram. Agrega redes o teléfono en sus fichas, o busca prospectos nuevos.' : 'No uncontacted prospects with WhatsApp or Instagram.'}</p>
        ) : (
          <ul className="divide-y">
            {filas.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center gap-2 py-2">
                <div className="min-w-0 flex-1">
                  <Link href={`/${lang}/dashboard/admin/crm/contacts/${f.id}`} className="truncate font-medium hover:underline">{f.empresa || f.nombre || '—'}</Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {f.empresa && f.nombre ? f.nombre : ''}
                    {f.sinCorreo && <Badge variant="outline" className="ml-2 align-middle text-[10px]">{es ? 'sin correo' : 'no email'}</Badge>}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {f.canales.map((c) => (
                    <Button key={c} size="sm" variant="outline" onClick={() => setAbierto({ fila: f, canal: c })} title={`${es ? 'Mensaje por' : 'Message on'} ${ETIQUETA_CANAL[c]}`}>
                      {c === 'instagram' ? <Instagram className="mr-1.5 h-3.5 w-3.5" /> : <MessageCircle className="mr-1.5 h-3.5 w-3.5" />}
                      {ETIQUETA_CANAL[c]}
                    </Button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
        {total > filas.length && <p className="pt-2 text-xs text-muted-foreground">{es ? `Se muestran ${filas.length} de ${total}. Los demás aparecen conforme avanzas.` : `Showing ${filas.length} of ${total}.`}</p>}
        {abierto && (
          <MensajeRedDialog
            contacto={{ id: abierto.fila.id, nombre: abierto.fila.nombre || abierto.fila.empresa, social_links: abierto.fila.contacto.social_links, instagram_url: abierto.fila.contacto.instagram_url, phone: abierto.fila.contacto.phone }}
            lang={lang}
            abierto
            canalInicial={abierto.canal}
            onClose={() => setAbierto(null)}
          />
        )}
      </CardContent>
    </Card>
  )
}
