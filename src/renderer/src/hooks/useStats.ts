import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STATS_STORAGE_KEY = 'claudoro_stats'

interface DailyStat {
  date: string
  completedSessions: number
  focusMinutes: number
}

interface StatsState {
  dailyStats: DailyStat[]
  currentStreak: number
  lastActiveDate: string | null
  recordPomodoroSession: (durationSeconds: number) => void
}

interface UseStatsResult {
  todayCompletedSessions: number
  todayFocusMinutes: number
  currentStreak: number
  recordPomodoroSession: (durationSeconds: number) => void
}

const formatDate = (date: Date): string => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

const getTodayKey = (): string => formatDate(new Date())

const subtractDays = (date: Date, days: number): Date => {
  const next = new Date(date)
  next.setDate(next.getDate() - days)
  return next
}

const calculateStreak = (dailyStats: DailyStat[]): number => {
  const activeDays = new Set(
    dailyStats.filter((stat) => stat.completedSessions > 0).map((stat) => stat.date)
  )

  let streak = 0
  let cursor = new Date()

  while (activeDays.has(formatDate(cursor))) {
    streak += 1
    cursor = subtractDays(cursor, 1)
  }

  return streak
}

const useStatsStore = create<StatsState>()(
  persist(
    (set) => ({
      dailyStats: [],
      currentStreak: 0,
      lastActiveDate: null,
      recordPomodoroSession: (durationSeconds) => {
        const today = getTodayKey()
        const roundedMinutes = Math.max(1, Math.round(durationSeconds / 60))

        set((state) => {
          const index = state.dailyStats.findIndex((item) => item.date === today)
          const nextDailyStats = [...state.dailyStats]

          if (index >= 0) {
            const target = nextDailyStats[index]
            nextDailyStats[index] = {
              ...target,
              completedSessions: target.completedSessions + 1,
              focusMinutes: target.focusMinutes + roundedMinutes
            }
          } else {
            nextDailyStats.push({
              date: today,
              completedSessions: 1,
              focusMinutes: roundedMinutes
            })
          }

          const limited = nextDailyStats.sort((a, b) => (a.date > b.date ? 1 : -1)).slice(-60)

          return {
            dailyStats: limited,
            lastActiveDate: today,
            currentStreak: calculateStreak(limited)
          }
        })
      }
    }),
    {
      name: STATS_STORAGE_KEY
    }
  )
)

export const useStats = (): UseStatsResult => {
  const today = getTodayKey()
  const dailyStats = useStatsStore((state) => state.dailyStats)
  const currentStreak = useStatsStore((state) => state.currentStreak)
  const recordPomodoroSession = useStatsStore((state) => state.recordPomodoroSession)

  const todayStat = dailyStats.find((stat) => stat.date === today)

  return {
    todayCompletedSessions: todayStat?.completedSessions ?? 0,
    todayFocusMinutes: todayStat?.focusMinutes ?? 0,
    currentStreak,
    recordPomodoroSession
  }
}
