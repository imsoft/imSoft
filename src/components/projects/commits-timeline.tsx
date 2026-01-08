'use client'

import { useEffect, useState } from 'react'
import { GitCommit, ExternalLink, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import type { Locale } from '@/app/[lang]/dictionaries'

interface SimplifiedCommit {
  sha: string
  message: string
  author: {
    name: string
    email: string
    date: string
    avatar: string | null
    username: string | null
  }
  url: string
  verified: boolean
}

interface CommitsTimelineProps {
  owner: string
  repo: string
  lang: Locale
}

export function CommitsTimeline({ owner, repo, lang }: CommitsTimelineProps) {
  const [commits, setCommits] = useState<SimplifiedCommit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchCommits() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/github/commits?owner=${owner}&repo=${repo}&per_page=20`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(errorData.error || 'Failed to fetch commits')
        }

        const data = await response.json()
        setCommits(data.commits)
      } catch (err) {
        console.error('Error fetching commits:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchCommits()
  }, [owner, repo])

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
        if (diffInMinutes === 0) {
          return lang === 'en' ? 'Just now' : 'Justo ahora'
        }
        return lang === 'en'
          ? `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
          : `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`
      }
      return lang === 'en'
        ? `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
        : `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    }

    if (diffInDays === 1) {
      return lang === 'en' ? 'Yesterday' : 'Ayer'
    }

    if (diffInDays < 7) {
      return lang === 'en'
        ? `${diffInDays} days ago`
        : `Hace ${diffInDays} días`
    }

    return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  function getCommitTitle(message: string) {
    return message.split('\n')[0]
  }

  function getCommitBody(message: string) {
    const lines = message.split('\n')
    let body = lines.slice(1).join('\n').trim()

    // Filtrar el texto generado por Claude Code
    const claudeCodePatterns = [
      /🤖 Generated with \[Claude Code\]\(https:\/\/claude\.com\/claude-code\)/g,
      /Co-Authored-By: Claude Sonnet [\d.]+ <noreply@anthropic\.com>/g,
    ]

    claudeCodePatterns.forEach(pattern => {
      body = body.replace(pattern, '')
    })

    // Limpiar líneas vacías múltiples
    body = body.replace(/\n{3,}/g, '\n\n').trim()

    return body
  }

  function toggleCommit(sha: string) {
    setExpandedCommits(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sha)) {
        newSet.delete(sha)
      } else {
        newSet.add(sha)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            {lang === 'en' ? 'Development Progress' : 'Progreso del Desarrollo'}
          </CardTitle>
          <CardDescription>
            {lang === 'en' ? 'Recent commits from the development team' : 'Commits recientes del equipo de desarrollo'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 items-start">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            {lang === 'en' ? 'Development Progress' : 'Progreso del Desarrollo'}
          </CardTitle>
          <CardDescription>
            {lang === 'en' ? 'Recent commits from the development team' : 'Commits recientes del equipo de desarrollo'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {lang === 'en' ? 'Unable to Load Commits' : 'No se Pueden Cargar los Commits'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {lang === 'en'
                ? 'The repository may be private or the GitHub integration needs to be configured. Contact the administrator for access.'
                : 'El repositorio puede ser privado o la integración con GitHub necesita ser configurada. Contacta al administrador para obtener acceso.'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (commits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            {lang === 'en' ? 'Development Progress' : 'Progreso del Desarrollo'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {lang === 'en' ? 'No commits found' : 'No se encontraron commits'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCommit className="h-5 w-5" />
          {lang === 'en' ? 'Development Progress' : 'Progreso del Desarrollo'}
        </CardTitle>
        <CardDescription>
          {lang === 'en'
            ? `Recent commits from ${owner}/${repo}`
            : `Commits recientes de ${owner}/${repo}`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          {commits.map((commit, index) => (
            <div key={commit.sha} className="relative flex gap-4">
              {/* Avatar with timeline dot */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-10 w-10 border-2 border-background">
                  {commit.author.avatar ? (
                    <AvatarImage src={commit.author.avatar} alt={commit.author.name} />
                  ) : null}
                  <AvatarFallback>
                    {commit.author.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Commit info */}
              <div className="flex-1 space-y-1 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">
                      {getCommitTitle(commit.message)}
                    </p>

                    {/* Cuerpo del commit (si existe) */}
                    {getCommitBody(commit.message) && (
                      <div className="mt-2">
                        {expandedCommits.has(commit.sha) ? (
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                            {getCommitBody(commit.message)}
                          </p>
                        ) : (
                          getCommitBody(commit.message).length > 100 && (
                            <p className="text-xs text-muted-foreground">
                              {getCommitBody(commit.message).substring(0, 100)}...
                            </p>
                          )
                        )}
                        {getCommitBody(commit.message).length > 100 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCommit(commit.sha)}
                            className="h-auto p-0 mt-1 text-xs text-primary hover:text-primary/80"
                          >
                            {expandedCommits.has(commit.sha) ? (
                              <>
                                <ChevronUp className="h-3 w-3 mr-1" />
                                {lang === 'en' ? 'Show less' : 'Ver menos'}
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3 mr-1" />
                                {lang === 'en' ? 'Show more' : 'Ver más'}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{commit.author.username || commit.author.name}</span>
                      <span>•</span>
                      <span>{formatDate(commit.author.date)}</span>
                      {commit.verified && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="gap-1 px-1.5 py-0">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            <span>{lang === 'en' ? 'Verified' : 'Verificado'}</span>
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                  <a
                    href={commit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
