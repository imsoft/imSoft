export default function BlogPostLoading() {
  return (
    <main className="pt-16">
      <article className="py-8 md:py-12 bg-background">
        <div className="mx-auto max-w-4xl px-6 animate-pulse">
          {/* Breadcrumb */}
          <div className="flex gap-2 mb-8">
            <div className="h-4 w-12 bg-muted rounded" />
            <div className="h-4 w-2 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded" />
            <div className="h-4 w-2 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded" />
          </div>

          {/* Category badge */}
          <div className="h-6 w-20 bg-muted rounded-full mb-4" />

          {/* Title */}
          <div className="h-10 bg-muted rounded w-full mb-3" />
          <div className="h-10 bg-muted rounded w-3/4 mb-6" />

          {/* Author row */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
            <div className="flex flex-col gap-1">
              <div className="h-4 w-28 bg-muted rounded" />
              <div className="h-3 w-40 bg-muted rounded" />
            </div>
          </div>

          {/* Featured image */}
          <div className="w-full h-[400px] bg-muted rounded-lg mb-8" />

          {/* Content */}
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`h-4 bg-muted rounded ${i % 3 === 2 ? 'w-4/5' : 'w-full'}`} />
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
