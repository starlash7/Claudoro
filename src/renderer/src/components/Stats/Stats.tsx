import GoalSection from './GoalSection'
import { useStats } from '../../hooks/useStats'
import StreakDetails from './StreakDetails'

interface StatCardProps {
  label: string
  value: string
}

interface ParsedValue {
  amount: string
  unit: string
}

const parseValue = (value: string): ParsedValue => {
  const match = value.trim().match(/^(\d+)([a-zA-Z]+)?$/)

  if (!match) {
    return { amount: value, unit: '' }
  }

  return {
    amount: match[1],
    unit: match[2] ?? ''
  }
}

function StatCard({ label, value }: StatCardProps): React.JSX.Element {
  const { amount, unit } = parseValue(value)

  return (
    <div className="terminal-soft-card stat-card flex min-h-[96px] flex-col justify-between p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
      <p className="stat-card-label">{label}</p>
      <p className="stat-card-value">
        <span className="stat-card-number">{amount}</span>
        {unit ? <span className="stat-card-unit">{unit}</span> : null}
      </p>
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

      <GoalSection />
    </section>
  )
}
