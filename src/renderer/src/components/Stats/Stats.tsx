import { useStats } from '../../hooks/useStats'

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
  const { todayCompletedSessions, todayFocusMinutes, currentStreak } = useStats()

  return (
    <section className="grid grid-cols-3 gap-2">
      <StatCard label="완료 세션" value={`${todayCompletedSessions}`} />
      <StatCard label="집중 시간" value={`${todayFocusMinutes}m`} />
      <StatCard label="연속 달성" value={`${currentStreak}d`} />
    </section>
  )
}
