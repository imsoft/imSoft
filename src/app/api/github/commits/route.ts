import { NextRequest, NextResponse } from 'next/server'
import type { GitHubCommit } from '@/types/github'

/**
 * GET /api/github/commits
 *
 * Obtiene los commits de un repositorio de GitHub
 *
 * Query params:
 * - owner: Propietario del repositorio (requerido)
 * - repo: Nombre del repositorio (requerido)
 * - per_page: Número de commits a obtener (opcional, default: 30, max: 100)
 * - page: Número de página (opcional, default: 1)
 *
 * Autenticación:
 * - Si GITHUB_ACCESS_TOKEN está configurado en .env, se usa para acceder a repos privados
 * - Sin token, solo funciona con repositorios públicos
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')
    const perPage = searchParams.get('per_page') || '30'
    const page = searchParams.get('page') || '1'

    // Validar parámetros requeridos
    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Owner and repo parameters are required' },
        { status: 400 }
      )
    }

    // Construir URL de la API de GitHub
    const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${page}`

    // Construir headers
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }

    // Agregar token si está disponible (permite acceso a repos privados)
    if (process.env.GITHUB_ACCESS_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`
    }

    // Hacer la solicitud a GitHub
    const response = await fetch(githubApiUrl, {
      headers,
      // Cachear por 5 minutos
      next: { revalidate: 300 }
    })

    // Manejar errores de GitHub
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Repository not found. Make sure the repository is public or provide a valid GitHub token.' },
          { status: 404 }
        )
      }

      if (response.status === 403) {
        return NextResponse.json(
          { error: 'GitHub API rate limit exceeded. Try again later or configure a GitHub token.' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch commits from GitHub' },
        { status: response.status }
      )
    }

    const commits: GitHubCommit[] = await response.json()

    // Transformar datos para enviar solo lo necesario al cliente
    const simplifiedCommits = commits.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        date: commit.commit.author.date,
        avatar: commit.author?.avatar_url || null,
        username: commit.author?.login || null,
      },
      url: commit.html_url,
      verified: commit.commit.verification?.verified || false,
    }))

    return NextResponse.json({ commits: simplifiedCommits })
  } catch (error) {
    console.error('Error fetching GitHub commits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
