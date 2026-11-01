import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton while the server builds the panel page. Without it, when navigating between
 * admin screens the browser paints nothing until the full response arrives, and each
 * click is measured as a multi-second interaction.
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
