import { Skeleton } from '@/components/ui/skeleton'

/**
 * Esqueleto mientras el servidor arma la pagina del panel. Sin esto, al navegar entre
 * pantallas del admin el navegador no pinta nada hasta que llega la respuesta completa,
 * y cada clic se mide como una interaccion de varios segundos.
 */
export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-72" />
    </div>
  )
}
