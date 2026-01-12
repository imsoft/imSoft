import { Skeleton } from '@/components/ui/skeleton'

interface CardSkeletonProps {
  cards?: number
}

export function CardSkeleton({ cards = 1 }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="space-y-3 p-6 border rounded-lg">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </>
  )
}
