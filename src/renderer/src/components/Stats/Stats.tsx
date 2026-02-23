import { useStats } from '../../hooks/useStats'
import StreakDetails from './StreakDetails'

interface StatCardProps {
  label: string
  value: string
}

function StatCard({ label, value }: StatCardProps): React.JSX.Element {
  return (
    <div className="terminal-soft-card flex min-h-[92px] flex-col items-center justify-center gap-1 p-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
      <p className="terminal-kicker whitespace-nowrap leading-none">{label}</p>
      <p className="text-2xl font-bold leading-none text-[var(--terminal-text)]">{value}</p>
    </div>
  )
}

export default function Stats(): React.JSX.Element {
  const { dailyStats, todayCompletedSessions, todayFocusMinutes, currentStreak, longestStreak } =
    useStats()

  return (
    <section className="space-y-3">
      <section className="terminal-card space-y-2 p-3">
        <div className="terminal-section-title mb-1">Today Stats</div>

        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Completed" value={`${todayCompletedSessions}`} />
          <StatCard label="Focus Time" value={`${todayFocusMinutes}m`} />
          <StatCard label="Current Streak" value={`${currentStreak}d`} />
        </div>
      </section>

      <StreakDetails
        currentStreak={currentStreak}
        dailyStats={dailyStats}
        longestStreak={longestStreak}
      />
    </section>
  )
}
