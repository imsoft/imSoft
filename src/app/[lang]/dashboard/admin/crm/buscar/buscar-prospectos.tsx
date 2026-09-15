'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExternalLink, Search, UserPlus } from 'lucide-react'
import { GIROS, MUNICIPIOS, type Candidato } from '@/lib/places'

export function BuscarProspectos({ lang, configurado }: { lang: string; configurado: boolean }) {
  const es = lang !== 'en'
  const router = useRouter()
  const [giro, setGiro] = useState(GIROS[0].clave)
  const [municipio, setMunicipio] = useState('zmg')
  const [query, setQuery] = useState('')
  const [correos, setCorreos] = useState(true)
  const [ocupado, setOcupado] = useState<'buscar' | 'importar' | null>(null)
  const [resultado, setResultado] = useState<{ candidatos: Candidato[]; segmento: string; nuevos: number } | null>(null)
  const [marcados, setMarcados] = useState<Set<string>>(new Set())

  const nuevos = useMemo(() => resultado?.candidatos.filter((c) => !c.enCrm) ?? [], [resultado])

  async function buscar() {
    setOcupado('buscar')
    setResultado(null)
    try {
      const r = await fetch('/api/prospects/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ giro, municipio, correos, query: query.trim() || undefined, max: 40 }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      setResultado(j)
      setMarcados(new Set((j.candidatos as Candidato[]).filter((c) => !c.enCrm && (c.correo || c.telefono || c.instagram)).map((c) => c.placeId)))
      toast.success(es ? `${j.candidatos.length} negocios, ${j.nuevos} nuevos para el CRM` : `${j.candidatos.length} businesses, ${j.nuevos} new`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setOcupado(null)
    }
  }

  async function importar() {
    if (!resultado) return
    const elegidos = resultado.candidatos.filter((c) => marcados.has(c.placeId))
    if (elegidos.length === 0) return toast.info(es ? 'Marca al menos un negocio.' : 'Select at least one business.')
    setOcupado('importar')
    try {
      const r = await fetch('/api/prospects/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidatos: elegidos, segmento: resultado.segmento }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      toast.success(es ? `${j.insertados} prospectos agregados al CRM` : `${j.insertados} prospects added`)
      setResultado({ ...resultado, candidatos: resultado.candidatos.map((c) => (marcados.has(c.placeId) ? { ...c, enCrm: true } : c)), nuevos: resultado.nuevos - elegidos.length })
      setMarcados(new Set())
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setOcupado(null)
    }
  }

  function alternar(id: string) {
    setMarcados((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  if (!configurado) {
    return <p className="text-sm text-destructive">{es ? 'Falta GOOGLE_PLACES_API_KEY en Vercel.' : 'Missing GOOGLE_PLACES_API_KEY.'}</p>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.4fr_auto] md:items-end">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{es ? 'Giro' : 'Industry'}</label>
          <Select value={giro} onValueChange={setGiro}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{GIROS.map((g) => <SelectItem key={g.clave} value={g.clave}>{g.nombre}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{es ? 'Municipio' : 'Municipality'}</label>
          <Select value={municipio} onValueChange={setMunicipio}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(MUNICIPIOS).map(([k, m]) => <SelectItem key={k} value={k}>{m.nombre}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{es ? 'Búsqueda propia (opcional, sustituye al giro)' : 'Custom query (optional)'}</label>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={es ? 'p. ej. "distribuidora de material eléctrico"' : 'e.g. "electrical supplies distributor"'} />
        </div>
        <Button onClick={buscar} disabled={ocupado !== null}><Search className="mr-2 h-4 w-4" />{ocupado === 'buscar' ? (es ? 'Buscando…' : 'Searching…') : es ? 'Buscar' : 'Search'}</Button>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={correos} onCheckedChange={(v) => setCorreos(Boolean(v))} />
        {es ? 'Buscar el correo en el sitio de cada negocio (tarda más, pero te deja el contacto listo para el correo en frío)' : 'Crawl each website for an email (slower, but ready for cold email)'}
      </label>

      {ocupado === 'buscar' && <p className="text-sm text-muted-foreground">{es ? 'Consultando Google Maps y visitando los sitios… puede tardar un minuto.' : 'Querying Google Maps and visiting websites… this can take a minute.'}</p>}

      {resultado && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {resultado.candidatos.length} {es ? 'encontrados' : 'found'} · <strong>{nuevos.length}</strong> {es ? 'nuevos' : 'new'} · {nuevos.filter((c) => c.correo).length} {es ? 'con correo' : 'with email'} · {marcados.size} {es ? 'marcados' : 'selected'}
            </p>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setMarcados(new Set(nuevos.filter((c) => c.correo || c.telefono || c.instagram).map((c) => c.placeId)))}>{es ? 'Marcar todos los nuevos' : 'Select all new'}</Button>
              <Button size="sm" onClick={importar} disabled={ocupado !== null || marcados.size === 0}><UserPlus className="mr-2 h-4 w-4" />{ocupado === 'importar' ? (es ? 'Agregando…' : 'Adding…') : es ? `Agregar ${marcados.size} al CRM` : `Add ${marcados.size} to CRM`}</Button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-3"></th>
                  <th className="p-3 text-left">{es ? 'Negocio' : 'Business'}</th>
                  <th className="p-3 text-left">{es ? 'Contacto' : 'Contact'}</th>
                  <th className="p-3 text-left">{es ? 'Sitio' : 'Website'}</th>
                  <th className="p-3 text-left">Google</th>
                  <th className="p-3 text-left">{es ? 'Estado' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {resultado.candidatos.map((c) => (
                  <tr key={c.placeId} className={`border-t ${c.enCrm ? 'opacity-50' : 'hover:bg-muted/30'}`}>
                    <td className="p-3 align-top"><Checkbox checked={marcados.has(c.placeId)} disabled={c.enCrm} onCheckedChange={() => alternar(c.placeId)} /></td>
                    <td className="p-3 align-top">
                      <p className="font-medium">{c.nombre}</p>
                      <p className="text-xs text-muted-foreground">{c.direccion}</p>
                      {c.tipo && <p className="text-xs text-muted-foreground">{c.tipo}</p>}
                    </td>
                    <td className="p-3 align-top whitespace-nowrap">
                      {c.correo ? <p>{c.correo}</p> : <p className="text-muted-foreground">{es ? 'sin correo' : 'no email'}</p>}
                      {c.telefono && <p className="text-xs text-muted-foreground">{c.telefono}</p>}
                      {c.instagram && <a className="text-xs text-primary underline-offset-4 hover:underline" href={c.instagram} target="_blank" rel="noreferrer">Instagram</a>}
                    </td>
                    <td className="p-3 align-top max-w-[200px] truncate">{c.sitio ? <a className="text-primary underline-offset-4 hover:underline" href={c.sitio} target="_blank" rel="noreferrer">{c.dominio ?? c.sitio}</a> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="p-3 align-top whitespace-nowrap">
                      {c.rating !== null && <span>{c.rating} ★ <span className="text-muted-foreground">({c.resenas})</span></span>}
                      {c.mapsUrl && <a className="ml-2 inline-flex align-middle text-muted-foreground hover:text-foreground" href={c.mapsUrl} target="_blank" rel="noreferrer" title="Google Maps"><ExternalLink className="h-3.5 w-3.5" /></a>}
                    </td>
                    <td className="p-3 align-top">{c.enCrm ? <Badge variant="secondary">{es ? 'Ya en el CRM' : 'In CRM'}</Badge> : <Badge>{es ? 'Nuevo' : 'New'}</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
