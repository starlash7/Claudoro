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

interface UseGitHubResult {
  metrics: GitHubMetrics
  loading: boolean
  error: string | null
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

const fetchGitHubJSON = async <T>(url: string, token: string): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `GitHub API request failed (${response.status})`)
  }

  return (await response.json()) as T
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

  return fetchWithCache(`today-commits:${username}:${repo}`, async () => {
    const commits = await fetchGitHubJSON<Array<{ sha: string }>>(url, token)
    return commits.length
  })
}

const fetchContributions = async (username: string, token: string): Promise<number[]> => {
  const dateKeys = buildRecentDateKeys()

  return fetchWithCache(`weekly-contrib:${username}`, async () => {
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

  return fetchWithCache(`open-prs:${username}:${repo}`, async () => {
    const pulls = await fetchGitHubJSON<Array<{ id: number }>>(url, token)
    return pulls.length
  })
}

const fetchOpenIssues = async (username: string, repo: string, token: string): Promise<number> => {
  const url = `https://api.github.com/repos/${username}/${repo}/issues?state=open&per_page=100`

  return fetchWithCache(`open-issues:${username}:${repo}`, async () => {
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
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  const isReady = useMemo(
    () => isGitHubEnabled && Boolean(githubToken && githubUsername && githubRepo),
    [isGitHubEnabled, githubToken, githubUsername, githubRepo]
  )

  const refresh = useCallback(async () => {
    if (!isReady) {
      setMetrics(emptyMetrics)
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

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
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to load GitHub data.'
      setError(message)
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
    lastUpdated,
    refresh
  }
}
