import { X } from 'lucide-react'
import type { DailyStat } from '../../hooks/useStats'

interface StreakDetailsProps {
  isOpen: boolean
  onClose: () => void
  dailyStats: DailyStat[]
  currentStreak: number
  longestStreak: number
}

interface CellData {
  dateKey: string
  dayOfMonth: string
  focusMinutes: number
}

const dateKey = (date: Date): string => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

const buildCells = (dailyStats: DailyStat[]): CellData[] => {
  const statMap = new Map(dailyStats.map((stat) => [stat.date, stat]))
  const today = new Date()

  return Array.from({ length: 30 }, (_, index) => {
    const target = new Date(today)
    target.setDate(today.getDate() - (29 - index))

    const key = dateKey(target)
    const stat = statMap.get(key)

    return {
      dateKey: key,
      dayOfMonth: key.slice(-2),
      focusMinutes: stat?.focusMinutes ?? 0
    }
  })
}

const getHeatColor = (focusMinutes: number): string => {
  if (focusMinutes <= 0) {
    return 'rgba(255, 255, 255, 0.06)'
  }

  if (focusMinutes < 30) {
    return 'rgba(94, 234, 212, 0.35)'
  }

  if (focusMinutes < 60) {
    return 'rgba(52, 211, 153, 0.55)'
  }

  if (focusMinutes < 120) {
    return 'rgba(16, 185, 129, 0.75)'
  }

  return 'rgba(5, 150, 105, 0.92)'
}

export default function StreakDetails({
  isOpen,
  onClose,
  dailyStats,
  currentStreak,
  longestStreak
}: StreakDetailsProps): React.JSX.Element | null {
  if (!isOpen) {
    return null
  }

  const cells = buildCells(dailyStats)

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#101327] p-4 shadow-2xl shadow-black/40">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/75">
            30일 스트릭 상세
          </h2>
          <button
            className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
            <p className="text-[11px] uppercase tracking-[0.1em] text-white/55">현재 스트릭</p>
            <p className="mt-1 text-xl font-bold text-white">{currentStreak}일</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
            <p className="text-[11px] uppercase tracking-[0.1em] text-white/55">최장 스트릭</p>
            <p className="mt-1 text-xl font-bold text-white">{longestStreak}일</p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0c1022] p-3">
          <div className="grid grid-cols-10 gap-1.5">
            {cells.map((cell) => (
              <div
                className="flex h-8 items-center justify-center rounded-md text-[10px] font-semibold text-white/70"
                key={cell.dateKey}
                style={{ backgroundColor: getHeatColor(cell.focusMinutes) }}
                title={`${cell.dateKey} · ${cell.focusMinutes}m`}
              >
                {cell.dayOfMonth}
              </div>
            ))}
          </div>

          <p className="mt-2 text-[11px] text-white/45">
            색이 진할수록 해당 날짜의 집중 시간이 길었습니다.
          </p>
        </div>
      </section>
    </div>
  )
}
