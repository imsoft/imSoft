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
import { INDUSTRIES, MUNICIPALITIES, isReachable, type Candidate } from '@/lib/places'

export function ProspectSearch({ lang, configured }: { lang: string; configured: boolean }) {
  const es = lang !== 'en'
  const router = useRouter()
  const [industry, setIndustry] = useState(INDUSTRIES[0].key)
  const [municipality, setMunicipality] = useState('zmg')
  const [query, setQuery] = useState('')
  const [emails, setEmails] = useState(true)
  const [busy, setBusy] = useState<'search' | 'import' | null>(null)
  const [result, setResult] = useState<{ candidates: Candidate[]; segment: string; newCount: number } | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const newOnes = useMemo(() => result?.candidates.filter((c) => !c.inCrm) ?? [], [result])

  async function search() {
    setBusy('search')
    setResult(null)
    try {
      const r = await fetch('/api/prospects/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ industry, municipality, emails, query: query.trim() || undefined, max: 40 }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      setResult(j)
      setChecked(new Set((j.candidates as Candidate[]).filter((c) => !c.inCrm && isReachable(c)).map((c) => c.placeId)))
      toast.success(es ? `${j.candidates.length} negocios, ${j.newCount} nuevos para el CRM` : `${j.candidates.length} businesses, ${j.newCount} new`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(null)
    }
  }

  async function importSelected() {
    if (!result) return
    const selected = result.candidates.filter((c) => checked.has(c.placeId))
    if (selected.length === 0) return toast.info(es ? 'Marca al menos un negocio.' : 'Select at least one business.')
    setBusy('import')
    try {
      const r = await fetch('/api/prospects/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidates: selected, segment: result.segment }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      toast.success(es ? `${j.inserted} prospectos agregados al CRM` : `${j.inserted} prospects added`)
      setResult({ ...result, candidates: result.candidates.map((c) => (checked.has(c.placeId) ? { ...c, inCrm: true } : c)), newCount: result.newCount - selected.length })
      setChecked(new Set())
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(null)
    }
  }

  function toggle(id: string) {
    setChecked((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  if (!configured) {
    return <p className="text-sm text-destructive">{es ? 'Falta GOOGLE_PLACES_API_KEY en Vercel.' : 'Missing GOOGLE_PLACES_API_KEY.'}</p>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.4fr_auto] md:items-end">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{es ? 'Giro' : 'Industry'}</label>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{INDUSTRIES.map((g) => <SelectItem key={g.key} value={g.key}>{g.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{es ? 'Municipio' : 'Municipality'}</label>
          <Select value={municipality} onValueChange={setMunicipality}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(MUNICIPALITIES).map(([k, m]) => <SelectItem key={k} value={k}>{m.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{es ? 'Búsqueda propia (opcional, sustituye al giro)' : 'Custom query (optional)'}</label>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={es ? 'p. ej. "Grupo Dalton" con el giro Empresas grandes' : 'e.g. "Grupo Dalton" with Large companies'} />
        </div>
        <Button onClick={search} disabled={busy !== null}><Search className="mr-2 h-4 w-4" />{busy === 'search' ? (es ? 'Buscando…' : 'Searching…') : es ? 'Buscar' : 'Search'}</Button>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={emails} onCheckedChange={(v) => setEmails(Boolean(v))} />
        {es ? 'Buscar el correo en el sitio de cada negocio (tarda más, pero te deja el contacto listo para el correo en frío)' : 'Crawl each website for an email (slower, but ready for cold email)'}
      </label>

      {busy === 'search' && <p className="text-sm text-muted-foreground">{es ? 'Consultando Google Maps y visitando los sitios… puede tardar un minuto.' : 'Querying Google Maps and visiting websites… this can take a minute.'}</p>}

      {result && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {result.candidates.length} {es ? 'encontrados' : 'found'} · <strong>{newOnes.length}</strong> {es ? 'nuevos' : 'new'} · {newOnes.filter((c) => c.email).length} {es ? 'con correo' : 'with email'} · {checked.size} {es ? 'marcados' : 'selected'}
            </p>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setChecked(new Set(newOnes.filter(isReachable).map((c) => c.placeId)))}>{es ? 'Marcar todos los nuevos' : 'Select all new'}</Button>
              <Button size="sm" onClick={importSelected} disabled={busy !== null || checked.size === 0}><UserPlus className="mr-2 h-4 w-4" />{busy === 'import' ? (es ? 'Agregando…' : 'Adding…') : es ? `Agregar ${checked.size} al CRM` : `Add ${checked.size} to CRM`}</Button>
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
                {result.candidates.map((c) => (
                  <tr key={c.placeId} className={`border-t ${c.inCrm ? 'opacity-50' : 'hover:bg-muted/30'}`}>
                    <td className="p-3 align-top"><Checkbox checked={checked.has(c.placeId)} disabled={c.inCrm || !isReachable(c)} onCheckedChange={() => toggle(c.placeId)} /></td>
                    <td className="p-3 align-top">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.address}</p>
                      {c.type && <p className="text-xs text-muted-foreground">{c.type}</p>}
                    </td>
                    <td className="p-3 align-top whitespace-nowrap">
                      {c.email ? <p>{c.email}</p> : <p className="text-muted-foreground">{isReachable(c) ? (es ? 'sin correo' : 'no email') : es ? 'sin correo, Instagram, WhatsApp ni celular: no se agrega' : 'no email, Instagram, WhatsApp or mobile: not added'}</p>}
                      {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                      {c.instagram && <a className="text-xs text-primary underline-offset-4 hover:underline" href={c.instagram} target="_blank" rel="noreferrer">Instagram</a>}
                      {c.whatsapp && <a className="block text-xs text-primary underline-offset-4 hover:underline" href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp +{c.whatsapp}</a>}
                    </td>
                    <td className="p-3 align-top max-w-[200px] truncate">{c.website ? <a className="text-primary underline-offset-4 hover:underline" href={c.website} target="_blank" rel="noreferrer">{c.domain ?? c.website}</a> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="p-3 align-top whitespace-nowrap">
                      {c.rating !== null && <span>{c.rating} ★ <span className="text-muted-foreground">({c.reviews})</span></span>}
                      {c.mapsUrl && <a className="ml-2 inline-flex align-middle text-muted-foreground hover:text-foreground" href={c.mapsUrl} target="_blank" rel="noreferrer" title="Google Maps"><ExternalLink className="h-3.5 w-3.5" /></a>}
                    </td>
                    <td className="p-3 align-top">{c.inCrm ? <Badge variant="secondary">{es ? 'Ya en el CRM' : 'In CRM'}</Badge> : <Badge>{es ? 'Nuevo' : 'New'}</Badge>}</td>
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
