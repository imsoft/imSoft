export default function BlogLoading() {
  return (
    <main className="pt-24">
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <div className="h-12 w-48 bg-muted rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-5 w-96 bg-muted rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border bg-white dark:bg-gray-900 animate-pulse">
                <div className="w-full h-48 bg-muted" />
                <div className="p-6 flex flex-col gap-3">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                  <div className="flex justify-between mt-2">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-4 bg-muted rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
