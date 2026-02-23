import { useMemo, useState } from 'react'
import { Github, RefreshCw, Settings } from 'lucide-react'
import { useGitHub } from '../../hooks/useGitHub'
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

export default function GitHubWidget(): React.JSX.Element {
  const isGitHubEnabled = useSettingsStore((state) => state.isGitHubEnabled)
  const githubUsername = useSettingsStore((state) => state.githubUsername)
  const githubRepo = useSettingsStore((state) => state.githubRepo)

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { metrics, loading, error, lastUpdated, refresh } = useGitHub()

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

  return (
    <section className="terminal-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="terminal-section-title">
          <Github size={16} />
          {isGitHubEnabled ? `${githubUsername}/${githubRepo}` : 'GitHub Integration'}
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
          <div className="grid grid-cols-2 gap-2">
            <MiniCard label="Today Commits" value={`${metrics.todayCommits}`} />
            <MiniCard label="Open PRs" value={`${metrics.openPRs}`} />
            <MiniCard label="Open Issues" value={`${metrics.openIssues}`} />
            <div className="terminal-soft-card p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
              <p className="terminal-kicker">Weekly Activity</p>
              <div className="mt-1.5 grid grid-cols-7 gap-1">{contributionCells}</div>
            </div>
          </div>

          <div className="mt-2 min-h-5 text-xs text-[var(--terminal-muted)]">
            {loading ? <p>Syncing GitHub data...</p> : null}
            {!loading && error ? <p className="text-[var(--accent-strong)]">{error}</p> : null}
            {!loading && !error && lastUpdated ? (
              <p>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</p>
            ) : null}
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
