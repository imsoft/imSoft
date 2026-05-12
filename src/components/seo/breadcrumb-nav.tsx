import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  name: string
  href?: string
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
  className?: string
}

export function BreadcrumbNav({ items, className = '' }: BreadcrumbNavProps) {
  return (
    <nav aria-label="breadcrumb" className={className}>
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          const isFirst = i === 0

          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />}
              {!isLast && item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  {isFirst && <Home className="h-3.5 w-3.5" />}
                  {!isFirst && item.name}
                </Link>
              ) : (
                <span className={`flex items-center gap-1 ${isLast ? 'text-foreground font-medium' : ''}`}>
                  {isFirst && <Home className="h-3.5 w-3.5" />}
                  {!isFirst && (
                    <span className="truncate max-w-[200px]">{item.name}</span>
                  )}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
