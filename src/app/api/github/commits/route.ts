import { NextRequest, NextResponse } from 'next/server'
import type { GitHubCommit } from '@/types/github'

/**
 * GET /api/github/commits
 *
 * Fetches the commits of a GitHub repository
 *
 * Query params:
 * - owner: repository owner (required)
 * - repo: repository name (required)
 * - per_page: number of commits to fetch (optional, default: 30, max: 100)
 * - page: page number (optional, default: 1)
 *
 * Authentication:
 * - If GITHUB_ACCESS_TOKEN is set in .env, it's used to access private repos
 * - Without a token, only public repositories work
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')
    const perPage = searchParams.get('per_page') || '30'
    const page = searchParams.get('page') || '1'

    // Validate required params
    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Owner and repo parameters are required' },
        { status: 400 }
      )
    }

    // Build the GitHub API URL
    const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${page}`

    // Build headers
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }

    // Add the token if available (allows access to private repos)
    if (process.env.GITHUB_ACCESS_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`
    }

    // Make the request to GitHub
    const response = await fetch(githubApiUrl, {
      headers,
      // Cache for 5 minutes
      next: { revalidate: 300 }
    })

    // Handle GitHub errors
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

    // Transform the data to send only what the client needs
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
