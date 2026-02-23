import type { DailyStat } from '../../hooks/useStats'

interface StreakDetailsProps {
  dailyStats: DailyStat[]
  currentStreak: number
  longestStreak: number
}

interface CellData {
  dateKey: string
  focusMinutes: number
  isFuture: boolean
}

const WEEKS_TO_SHOW = 52
const DAYS_TO_SHOW = WEEKS_TO_SHOW * 7

const dateKey = (date: Date): string => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

const buildCells = (dailyStats: DailyStat[]): CellData[] => {
  const statMap = new Map(dailyStats.map((stat) => [stat.date, stat]))
  const today = new Date()
  const todayKey = dateKey(today)
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()))

  return Array.from({ length: DAYS_TO_SHOW }, (_, index) => {
    const target = new Date(endOfWeek)
    target.setDate(endOfWeek.getDate() - (DAYS_TO_SHOW - 1 - index))

    const key = dateKey(target)
    const stat = statMap.get(key)

    return {
      dateKey: key,
      focusMinutes: stat?.focusMinutes ?? 0,
      isFuture: key > todayKey
    }
  })
}

const buildWeekColumns = (cells: CellData[]): CellData[][] => {
  const columns: CellData[][] = []

  for (let index = 0; index < cells.length; index += 7) {
    columns.push(cells.slice(index, index + 7))
  }

  return columns
}

const buildMonthLabels = (weekColumns: CellData[][]): string[] => {
  let lastMonth = -1

  return weekColumns.map((week) => {
    const date = new Date(`${week[0].dateKey}T00:00:00`)
    const month = date.getMonth()

    if (month !== lastMonth) {
      lastMonth = month
      return date.toLocaleString('en-US', { month: 'short' })
    }

    return ''
  })
}

const getHeatColor = (focusMinutes: number): string => {
  if (focusMinutes <= 0) {
    return '#fff4ef'
  }

  if (focusMinutes < 20) {
    return '#f8d7ca'
  }

  if (focusMinutes < 45) {
    return '#f0b59f'
  }

  if (focusMinutes < 90) {
    return '#e28d71'
  }

  return '#d97757'
}

export default function StreakDetails({
  dailyStats,
  currentStreak,
  longestStreak
}: StreakDetailsProps): React.JSX.Element {
  const cells = buildCells(dailyStats)
  const weekColumns = buildWeekColumns(cells)
  const monthLabels = buildMonthLabels(weekColumns)
  const totalFocusMinutes = cells.reduce((sum, cell) => sum + cell.focusMinutes, 0)

  return (
    <section className="terminal-card p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="terminal-section-title">Focus Heatmap</h2>
        <div className="flex items-center gap-2 text-[11px] text-[var(--terminal-dim)]">
          <span>{currentStreak}d</span>
          <span>·</span>
          <span>Best {longestStreak}d</span>
        </div>
      </div>

      <div className="terminal-soft-card overflow-x-auto p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
        <div className="mb-2 flex min-w-max gap-1 pl-5 text-[10px] text-[var(--terminal-dim)]">
          {monthLabels.map((label, index) => (
            <div className="w-3" key={`month-${index}`}>
              {label}
            </div>
          ))}
        </div>

        <div className="flex min-w-max gap-2">
          <div className="grid grid-rows-7 gap-1 text-[10px] text-[var(--terminal-dim)]">
            {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((label, index) => (
              <span className="h-2.5 leading-[10px]" key={`day-${index}`}>
                {label}
              </span>
            ))}
          </div>

          <div className="flex gap-1">
            {weekColumns.map((week, weekIndex) => (
              <div className="grid grid-rows-7 gap-1" key={`week-${weekIndex}`}>
                {week.map((cell) => (
                  <div
                    className="h-2.5 w-2.5 rounded-[2px] border border-[rgba(217,119,87,0.18)]"
                    key={cell.dateKey}
                    style={{
                      backgroundColor: cell.isFuture
                        ? 'rgba(217,119,87,0.04)'
                        : getHeatColor(cell.focusMinutes)
                    }}
                    title={`${cell.dateKey} · ${cell.focusMinutes}m`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-[var(--terminal-dim)]">
          <p>
            {totalFocusMinutes} minutes focused in the last {WEEKS_TO_SHOW} weeks
          </p>
          <div className="flex items-center gap-1">
            <span>Less</span>
            {[0, 20, 45, 90].map((value) => (
              <div
                className="h-2.5 w-2.5 rounded-[2px] border border-[rgba(217,119,87,0.18)]"
                key={value}
                style={{ backgroundColor: getHeatColor(value) }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </section>
  )
}
