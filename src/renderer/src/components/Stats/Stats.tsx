import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { useStats } from '../../hooks/useStats'
import StreakDetails from './StreakDetails'

interface StatCardProps {
  label: string
  value: string
}

function StatCard({ label, value }: StatCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
    </div>
  )
}

export default function Stats(): React.JSX.Element {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const { dailyStats, todayCompletedSessions, todayFocusMinutes, currentStreak, longestStreak } =
    useStats()

  return (
    <>
      <section className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="완료 세션" value={`${todayCompletedSessions}`} />
          <StatCard label="집중 시간" value={`${todayFocusMinutes}m`} />
          <StatCard label="연속 달성" value={`${currentStreak}d`} />
        </div>

        <div className="flex justify-end">
          <button
            className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white"
            onClick={() => {
              setIsDetailsOpen(true)
            }}
            type="button"
          >
            <span className="flex items-center gap-1.5">
              <CalendarDays size={12} /> 스트릭 상세
            </span>
          </button>
        </div>
      </section>

      <StreakDetails
        currentStreak={currentStreak}
        dailyStats={dailyStats}
        isOpen={isDetailsOpen}
        longestStreak={longestStreak}
        onClose={() => {
          setIsDetailsOpen(false)
        }}
      />
    </>
  )
}
