import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSettingsStore } from '../store/settingsStore'

interface GitHubEvent {
  type: string
  created_at: string
  payload?: {
    commits?: Array<{ sha: string }>
  }
}

interface GitHubIssue {
  pull_request?: unknown
}

interface GitHubMetrics {
  todayCommits: number
  weeklyContributions: number[]
  openPRs: number
  openIssues: number
}

export type GitHubErrorCode =
  | 'auth'
  | 'forbidden'
  | 'rate_limit'
  | 'not_found'
  | 'network'
  | 'unknown'

interface UseGitHubResult {
  metrics: GitHubMetrics
  loading: boolean
  error: string | null
  errorCode: GitHubErrorCode | null
  lastUpdated: number | null
  refresh: () => Promise<void>
}

const CACHE_TTL_MS = 5 * 60 * 1000
const REFRESH_INTERVAL_MS = 15 * 60 * 1000

const queryCache = new Map<string, { expiresAt: number; value: unknown }>()

const emptyMetrics: GitHubMetrics = {
  todayCommits: 0,
  weeklyContributions: [0, 0, 0, 0, 0, 0, 0],
  openPRs: 0,
  openIssues: 0
}

const toLocalDateKey = (date: Date): string => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

const buildRecentDateKeys = (): string[] => {
  const today = new Date()

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    return toLocalDateKey(date)
  })
}

const getCached = <T>(key: string): T | null => {
  const hit = queryCache.get(key)

  if (!hit) {
    return null
  }

  if (Date.now() > hit.expiresAt) {
    queryCache.delete(key)
    return null
  }

  return hit.value as T
}

const setCached = <T>(key: string, value: T): T => {
  queryCache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS
  })

  return value
}

const fetchWithCache = async <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
  const cached = getCached<T>(key)

  if (cached !== null) {
    return cached
  }

  const value = await fetcher()
  return setCached(key, value)
}

class GitHubRequestError extends Error {
  code: GitHubErrorCode
  status: number

  constructor(code: GitHubErrorCode, status: number, message: string) {
    super(message)
    this.code = code
    this.status = status
  }
}

const getErrorCodeByResponse = (response: Response): GitHubErrorCode => {
  if (response.status === 401) {
    return 'auth'
  }

  if (response.status === 404) {
    return 'not_found'
  }

  if (response.status === 403) {
    const limitRemaining = response.headers.get('x-ratelimit-remaining')
    return limitRemaining === '0' ? 'rate_limit' : 'forbidden'
  }

  return 'unknown'
}

const parseGitHubErrorMessage = async (
  response: Response,
  fallback: string
): Promise<{ code: GitHubErrorCode; message: string }> => {
  const code = getErrorCodeByResponse(response)
  const contentType = response.headers.get('content-type') ?? ''
  let rawMessage = ''

  if (contentType.includes('application/json')) {
    try {
      const payload = (await response.json()) as { message?: string }
      rawMessage = payload.message?.trim() ?? ''
    } catch {
      rawMessage = ''
    }
  } else {
    rawMessage = (await response.text()).trim()
  }

  if (rawMessage) {
    return {
      code,
      message: rawMessage
    }
  }

  if (code === 'auth') {
    return { code, message: 'GitHub token is invalid or expired. Please reconnect in Settings.' }
  }

  if (code === 'rate_limit') {
    return { code, message: 'GitHub API rate limit reached. Try again later.' }
  }

  if (code === 'not_found') {
    return { code, message: 'Repository or username not found. Check your GitHub settings.' }
  }

  if (code === 'forbidden') {
    return { code, message: 'GitHub access is forbidden for this token or repository.' }
  }

  return { code, message: fallback }
}

const fetchGitHubJSON = async <T>(url: string, token: string): Promise<T> => {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const parsed = await parseGitHubErrorMessage(
        response,
        `GitHub API request failed (${response.status})`
      )
      throw new GitHubRequestError(parsed.code, response.status, parsed.message)
    }

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof GitHubRequestError) {
      throw error
    }

    throw new GitHubRequestError(
      'network',
      0,
      'Unable to reach GitHub API. Check network and retry.'
    )
  }
}

const tokenCacheKey = (token: string): string => {
  if (!token) {
    return 'none'
  }

  const head = token.slice(0, 3)
  const tail = token.slice(-3)
  return `${token.length}:${head}:${tail}`
}

const fetchTodayCommits = async (
  username: string,
  repo: string,
  token: string
): Promise<number> => {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  const params = new URLSearchParams({
    since: start.toISOString(),
    until: end.toISOString(),
    author: username,
    per_page: '100'
  })

  const url = `https://api.github.com/repos/${username}/${repo}/commits?${params.toString()}`
  const authKey = tokenCacheKey(token)

  return fetchWithCache(`today-commits:${username}:${repo}:${authKey}`, async () => {
    const commits = await fetchGitHubJSON<Array<{ sha: string }>>(url, token)
    return commits.length
  })
}

const fetchContributions = async (username: string, token: string): Promise<number[]> => {
  const dateKeys = buildRecentDateKeys()
  const authKey = tokenCacheKey(token)

  return fetchWithCache(`weekly-contrib:${username}:${authKey}`, async () => {
    const events = await fetchGitHubJSON<GitHubEvent[]>(
      `https://api.github.com/users/${username}/events?per_page=100`,
      token
    )

    const next = dateKeys.map(() => 0)

    events.forEach((event) => {
      if (event.type !== 'PushEvent') {
        return
      }

      const key = toLocalDateKey(new Date(event.created_at))
      const index = dateKeys.indexOf(key)

      if (index < 0) {
        return
      }

      next[index] += event.payload?.commits?.length ?? 1
    })

    return next
  })
}

const fetchOpenPRs = async (username: string, repo: string, token: string): Promise<number> => {
  const url = `https://api.github.com/repos/${username}/${repo}/pulls?state=open&per_page=100`
  const authKey = tokenCacheKey(token)

  return fetchWithCache(`open-prs:${username}:${repo}:${authKey}`, async () => {
    const pulls = await fetchGitHubJSON<Array<{ id: number }>>(url, token)
    return pulls.length
  })
}

const fetchOpenIssues = async (username: string, repo: string, token: string): Promise<number> => {
  const url = `https://api.github.com/repos/${username}/${repo}/issues?state=open&per_page=100`
  const authKey = tokenCacheKey(token)

  return fetchWithCache(`open-issues:${username}:${repo}:${authKey}`, async () => {
    const issues = await fetchGitHubJSON<GitHubIssue[]>(url, token)
    return issues.filter((issue) => !issue.pull_request).length
  })
}

export const useGitHub = (): UseGitHubResult => {
  const githubToken = useSettingsStore((state) => state.githubToken)
  const githubUsername = useSettingsStore((state) => state.githubUsername)
  const githubRepo = useSettingsStore((state) => state.githubRepo)
  const isGitHubEnabled = useSettingsStore((state) => state.isGitHubEnabled)

  const [metrics, setMetrics] = useState<GitHubMetrics>(emptyMetrics)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<GitHubErrorCode | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  const isReady = useMemo(
    () => isGitHubEnabled && Boolean(githubToken && githubUsername && githubRepo),
    [isGitHubEnabled, githubToken, githubUsername, githubRepo]
  )

  const refresh = useCallback(async () => {
    if (!isReady) {
      setMetrics(emptyMetrics)
      setError(null)
      setErrorCode(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setErrorCode(null)

    try {
      const [todayCommits, weeklyContributions, openPRs, openIssues] = await Promise.all([
        fetchTodayCommits(githubUsername, githubRepo, githubToken),
        fetchContributions(githubUsername, githubToken),
        fetchOpenPRs(githubUsername, githubRepo, githubToken),
        fetchOpenIssues(githubUsername, githubRepo, githubToken)
      ])

      setMetrics({
        todayCommits,
        weeklyContributions,
        openPRs,
        openIssues
      })
      setLastUpdated(Date.now())
    } catch (requestError) {
      if (requestError instanceof GitHubRequestError) {
        setErrorCode(requestError.code)
        setError(requestError.message)
      } else {
        setErrorCode('unknown')
        setError(
          requestError instanceof Error ? requestError.message : 'Failed to load GitHub data.'
        )
      }
    } finally {
      setLoading(false)
    }
  }, [isReady, githubToken, githubUsername, githubRepo])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!isReady) {
      return
    }

    const interval = window.setInterval(() => {
      void refresh()
    }, REFRESH_INTERVAL_MS)

    return () => {
      window.clearInterval(interval)
    }
  }, [isReady, refresh])

  return {
    metrics,
    loading,
    error,
    errorCode,
    lastUpdated,
    refresh
  }
}
