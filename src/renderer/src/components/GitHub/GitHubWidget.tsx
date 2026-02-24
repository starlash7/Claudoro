import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Github, RefreshCw, Settings } from 'lucide-react'
import { useGitHub } from '../../hooks/useGitHub'
import { useStats } from '../../hooks/useStats'
import { useSettingsStore } from '../../store/settingsStore'
import GitHubSettings from './GitHubSettings'

function MiniCard({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="terminal-soft-card p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
      <p className="terminal-kicker">{label}</p>
      <p className="mt-1 text-lg font-bold text-[var(--terminal-text)]">{value}</p>
    </div>
  )
}

const formatAge = (from: number, to: number): string => {
  const seconds = Math.max(0, Math.floor((to - from) / 1000))

  if (seconds < 10) {
    return 'just now'
  }

  if (seconds < 60) {
    return `${seconds}s ago`
  }

  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ago`
  }

  if (seconds < 86_400) {
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return `${Math.floor(seconds / 86_400)}d ago`
}

export default function GitHubWidget(): React.JSX.Element {
  const isGitHubEnabled = useSettingsStore((state) => state.isGitHubEnabled)
  const githubUsername = useSettingsStore((state) => state.githubUsername)
  const githubRepo = useSettingsStore((state) => state.githubRepo)
  const githubRepoVerified = useSettingsStore((state) => state.githubRepoVerified)
  const githubRepoVerifiedAt = useSettingsStore((state) => state.githubRepoVerifiedAt)
  const todayFocusMinutes = useStats().todayFocusMinutes

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [clock, setClock] = useState(() => Date.now())
  const { metrics, loading, error, errorCode, lastUpdated, refresh } = useGitHub()

  const focusPerCommit =
    metrics.todayCommits > 0 ? `${Math.round(todayFocusMinutes / metrics.todayCommits)}m` : '--'

  const contributionCells = useMemo(
    () =>
      metrics.weeklyContributions.map((count, index) => {
        const opacity = count === 0 ? 0.14 : Math.min(0.94, 0.26 + count * 0.14)

        return (
          <div
            className="h-5 w-5 rounded-md border border-[var(--terminal-border-soft)]"
            key={`contrib-${index}`}
            style={{
              backgroundColor: `rgba(217, 119, 87, ${opacity})`
            }}
            title={`${count} commits`}
          />
        )
      }),
    [metrics.weeklyContributions]
  )

  const canOpenSettingsFromError = errorCode === 'auth' || errorCode === 'not_found'
  const syncAge = lastUpdated ? formatAge(lastUpdated, clock) : null
  const verifyAge = githubRepoVerifiedAt ? formatAge(githubRepoVerifiedAt, clock) : null

  useEffect(() => {
    const interval = window.setInterval(() => {
      setClock(Date.now())
    }, 30_000)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  return (
    <section className="terminal-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="terminal-section-title">
            <Github size={16} />
            {isGitHubEnabled ? `${githubUsername}/${githubRepo}` : 'GitHub Integration'}
          </div>
          {isGitHubEnabled && githubRepoVerified ? (
            <span className="inline-flex items-center gap-1 rounded border border-[var(--accent)] bg-[rgba(217,119,87,0.12)] px-2 py-0.5 text-[10px] font-semibold tracking-[0.05em] text-[var(--accent-strong)]">
              <CheckCircle2 size={11} />
              {verifyAge ? `Repo Verified · ${verifyAge}` : 'Repo Verified'}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {isGitHubEnabled ? (
            <button
              className="terminal-icon-btn p-1.5"
              onClick={() => {
                void refresh()
              }}
              title="Refresh"
              type="button"
            >
              <RefreshCw size={14} />
            </button>
          ) : null}
          <button
            className="terminal-icon-btn p-1.5"
            onClick={() => {
              setIsSettingsOpen(true)
            }}
            title="Settings"
            type="button"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {!isGitHubEnabled ? (
        <div className="terminal-soft-card border-dashed p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
          <p className="text-sm text-[var(--terminal-muted)]">
            Connect GitHub to view today&apos;s commits, PRs, and issues.
          </p>
          <button
            className="terminal-btn terminal-btn-primary mt-3"
            onClick={() => {
              setIsSettingsOpen(true)
            }}
            type="button"
          >
            Connect GitHub
          </button>
        </div>
      ) : (
        <>
          {!githubRepoVerified ? (
            <div className="terminal-soft-card mb-2 border-dashed p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-[var(--terminal-muted)]">
                  Repo access is not verified yet. Run connection test in Settings.
                </p>
                <button
                  className="terminal-btn terminal-btn-secondary px-2 py-1 text-[11px]"
                  onClick={() => {
                    setIsSettingsOpen(true)
                  }}
                  type="button"
                >
                  Verify Now
                </button>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <MiniCard label="Today Commits" value={`${metrics.todayCommits}`} />
            <MiniCard label="Focus / Commit" value={focusPerCommit} />
            <MiniCard label="Open PRs" value={`${metrics.openPRs}`} />
            <MiniCard label="Open Issues" value={`${metrics.openIssues}`} />
            <div className="terminal-soft-card p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
              <p className="terminal-kicker">Weekly Activity</p>
              <div className="mt-1.5 grid grid-cols-7 gap-1">{contributionCells}</div>
            </div>
            <MiniCard label="Today Focus" value={`${todayFocusMinutes}m`} />
          </div>

          <div className="mt-2 min-h-5 text-xs text-[var(--terminal-muted)]">
            {loading ? <p>Syncing GitHub data...</p> : null}
            {!loading && error ? (
              <div className="flex items-center justify-between gap-2">
                <p className="text-[var(--accent-strong)]">{error}</p>
                {canOpenSettingsFromError ? (
                  <button
                    className="terminal-btn terminal-btn-secondary px-2 py-1 text-[11px]"
                    onClick={() => {
                      setIsSettingsOpen(true)
                    }}
                    type="button"
                  >
                    Fix Settings
                  </button>
                ) : null}
              </div>
            ) : null}
            {!loading && !error && syncAge ? <p>Last sync: {syncAge}</p> : null}
          </div>
        </>
      )}

      <GitHubSettings
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false)
        }}
      />
    </section>
  )
}
