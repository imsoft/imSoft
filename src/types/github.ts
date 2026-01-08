// Tipos para la API de GitHub

export interface GitHubCommit {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    committer: {
      name: string
      email: string
      date: string
    }
    message: string
    tree: {
      sha: string
      url: string
    }
    url: string
    comment_count: number
    verification: {
      verified: boolean
      reason: string
      signature: string | null
      payload: string | null
    }
  }
  url: string
  html_url: string
  comments_url: string
  author: {
    login: string
    id: number
    avatar_url: string
    html_url: string
  } | null
  committer: {
    login: string
    id: number
    avatar_url: string
    html_url: string
  } | null
  parents: Array<{
    sha: string
    url: string
    html_url: string
  }>
}

export interface GitHubCommitsResponse {
  commits: GitHubCommit[]
  error?: string
}

export interface GitHubRepoInfo {
  owner: string
  repo: string
}
