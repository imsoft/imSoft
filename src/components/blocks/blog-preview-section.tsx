import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CalendarDays, Tag } from 'lucide-react'
import { ScrollReveal } from "@/components/animations/scroll-reveal"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  image_url?: string
  category?: string
  created_at?: string
}

interface BlogPreviewSectionProps {
  lang: string
  posts: BlogPost[]
}

export function BlogPreviewSection({ lang, posts }: BlogPreviewSectionProps) {
  const isEs = lang === 'es'

  if (!posts || posts.length === 0) return null

  const displayPosts = posts.slice(0, 3)

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12" direction="up">
          <div>
            <span className="inline-block text-primary text-sm font-semibold tracking-widest uppercase mb-3">
              {isEs ? 'Blog' : 'Blog'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-balance">
              {isEs ? 'Últimos artículos' : 'Latest articles'}
            </h2>
            <p className="text-muted-foreground mt-2 text-balance">
              {isEs
                ? 'Recursos y perspectivas sobre tecnología, desarrollo y transformación digital.'
                : 'Resources and insights on technology, development and digital transformation.'}
            </p>
          </div>
          <Link
            href={`/${lang}/blog`}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
          >
            {isEs ? 'Ver todos los artículos' : 'View all articles'}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </ScrollReveal>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPosts.map((post, index) => (
            <ScrollReveal key={post.id} direction="up" delay={index * 0.08}>
              <Link
                href={`/${lang}/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 hover:border-primary/30 h-full"
              >
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  {post.image_url ? (
                    <Image
                      src={post.image_url}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <span className="text-4xl">📝</span>
                    </div>
                  )}
                  {post.category && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-foreground border border-border/50">
                      <Tag className="h-3 w-3 text-primary" />
                      {post.category}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow p-5 gap-3">
                  <h3 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-grow">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    {post.created_at && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(post.created_at).toLocaleDateString(isEs ? 'es-MX' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      {isEs ? 'Leer más' : 'Read more'}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
