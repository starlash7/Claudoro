import { POMODOROS_BEFORE_LONG_BREAK, type TimerMode } from '../../../shared/constants'
import { useTimerStore } from '../store/timerStore'

interface UsePomodoroResult {
  cycleLabel: string
  nextModeLabel: string
  isBreak: boolean
  skipToNext: () => void
}

const modeLabel: Record<TimerMode, string> = {
  pomodoro: 'Pomodoro',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
  deepFocus: 'Deep Focus'
}

export const usePomodoro = (): UsePomodoroResult => {
  const mode = useTimerStore((state) => state.mode)
  const completedPomodoros = useTimerStore((state) => state.completedPomodoros)
  const completeSession = useTimerStore((state) => state.completeSession)

  const currentCycle = (completedPomodoros % POMODOROS_BEFORE_LONG_BREAK) + 1

  let nextMode: TimerMode = 'pomodoro'

  if (mode === 'pomodoro') {
    const nextCount = completedPomodoros + 1
    const shouldLongBreak = nextCount % POMODOROS_BEFORE_LONG_BREAK === 0
    nextMode = shouldLongBreak ? 'longBreak' : 'shortBreak'
  }

  if (mode === 'deepFocus') {
    nextMode = 'pomodoro'
  }

  const isBreak = mode === 'shortBreak' || mode === 'longBreak'

  return {
    cycleLabel: `${currentCycle}/${POMODOROS_BEFORE_LONG_BREAK}`,
    nextModeLabel: modeLabel[nextMode],
    isBreak,
    skipToNext: completeSession
  }
}
