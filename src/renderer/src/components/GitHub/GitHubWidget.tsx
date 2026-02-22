import { useMemo, useState } from 'react'
import { Github, RefreshCw, Settings } from 'lucide-react'
import { useGitHub } from '../../hooks/useGitHub'
import { useSettingsStore } from '../../store/settingsStore'
import GitHubSettings from './GitHubSettings'

function MiniCard({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/50">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
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
        const opacity = count === 0 ? 0.15 : Math.min(0.95, 0.25 + count * 0.15)

        return (
          <div
            className="h-5 w-5 rounded-md border border-white/10"
            key={`contrib-${index}`}
            style={{
              backgroundColor: `rgba(62, 207, 142, ${opacity})`
            }}
            title={`${count} commits`}
          />
        )
      }),
    [metrics.weeklyContributions]
  )

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/85">
          <Github size={16} />
          {isGitHubEnabled ? `${githubUsername}/${githubRepo}` : 'GitHub 위젯'}
        </div>
        <div className="flex items-center gap-1">
          {isGitHubEnabled ? (
            <button
              className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              onClick={() => {
                void refresh()
              }}
              title="새로고침"
              type="button"
            >
              <RefreshCw size={14} />
            </button>
          ) : null}
          <button
            className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            onClick={() => {
              setIsSettingsOpen(true)
            }}
            title="설정"
            type="button"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {!isGitHubEnabled ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-[#0f1225] p-3">
          <p className="text-sm text-white/70">
            GitHub를 연결하면 오늘 커밋/PR/이슈를 바로 볼 수 있습니다.
          </p>
          <button
            className="mt-3 rounded-xl bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            onClick={() => {
              setIsSettingsOpen(true)
            }}
            type="button"
          >
            GitHub 연결하기
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <MiniCard label="오늘 커밋" value={`${metrics.todayCommits}`} />
            <MiniCard label="열린 PR" value={`${metrics.openPRs}`} />
            <MiniCard label="열린 이슈" value={`${metrics.openIssues}`} />
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/50">
                주간 활동
              </p>
              <div className="mt-1.5 grid grid-cols-7 gap-1">{contributionCells}</div>
            </div>
          </div>

          <div className="mt-2 min-h-5 text-xs text-white/55">
            {loading ? <p>GitHub 데이터 동기화 중...</p> : null}
            {!loading && error ? <p className="text-rose-300">{error}</p> : null}
            {!loading && !error && lastUpdated ? (
              <p>마지막 갱신: {new Date(lastUpdated).toLocaleTimeString()}</p>
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
