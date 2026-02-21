import { create } from 'zustand'
import {
  POMODOROS_BEFORE_LONG_BREAK,
  TIMER_DURATIONS,
  type MascotState,
  type TimerMode,
  type TimerStatus
} from '../../../shared/constants'

interface TimerState {
  mode: TimerMode
  status: TimerStatus
  timeRemaining: number
  totalTime: number
  completedPomodoros: number
  mascotState: MascotState
  goal: string
  setMode: (mode: TimerMode) => void
  setGoal: (goal: string) => void
  start: () => void
  pause: () => void
  reset: () => void
  tick: () => void
  completeSession: () => void
}

const getModeDuration = (mode: TimerMode): number => {
  if (mode === 'deepFocus') {
    return 0
  }

  return TIMER_DURATIONS[mode]
}

const getMascotStateForMode = (mode: TimerMode): MascotState => {
  if (mode === 'shortBreak' || mode === 'longBreak') {
    return 'break'
  }

  return 'focusing'
}

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: 'pomodoro',
  status: 'idle',
  timeRemaining: TIMER_DURATIONS.pomodoro,
  totalTime: TIMER_DURATIONS.pomodoro,
  completedPomodoros: 0,
  mascotState: 'idle',
  goal: '',

  setMode: (mode) => {
    const modeDuration = getModeDuration(mode)

    set({
      mode,
      status: 'idle',
      timeRemaining: modeDuration,
      totalTime: modeDuration,
      mascotState: 'idle'
    })
  },

  setGoal: (goal) => {
    set({ goal })
  },

  start: () => {
    const { mode } = get()
    set({
      status: 'running',
      mascotState: getMascotStateForMode(mode)
    })
  },

  pause: () => {
    set({
      status: 'paused',
      mascotState: 'idle'
    })
  },

  reset: () => {
    const { mode } = get()
    const modeDuration = getModeDuration(mode)

    set({
      status: 'idle',
      timeRemaining: modeDuration,
      totalTime: modeDuration,
      mascotState: 'idle'
    })
  },

  tick: () => {
    const { status, mode, timeRemaining } = get()

    if (status !== 'running') {
      return
    }

    if (mode === 'deepFocus') {
      set((state) => ({
        timeRemaining: state.timeRemaining + 1,
        totalTime: state.totalTime + 1
      }))
      return
    }

    if (timeRemaining > 0) {
      set({ timeRemaining: timeRemaining - 1 })
    }
  },

  completeSession: () => {
    const { mode, completedPomodoros } = get()

    if (mode === 'pomodoro') {
      const nextPomodoros = completedPomodoros + 1
      const shouldLongBreak = nextPomodoros % POMODOROS_BEFORE_LONG_BREAK === 0
      const nextMode: TimerMode = shouldLongBreak ? 'longBreak' : 'shortBreak'
      const duration = TIMER_DURATIONS[nextMode]

      set({
        mode: nextMode,
        status: 'idle',
        timeRemaining: duration,
        totalTime: duration,
        completedPomodoros: nextPomodoros,
        mascotState: 'complete'
      })
      return
    }

    if (mode === 'shortBreak' || mode === 'longBreak') {
      set({
        mode: 'pomodoro',
        status: 'idle',
        timeRemaining: TIMER_DURATIONS.pomodoro,
        totalTime: TIMER_DURATIONS.pomodoro,
        mascotState: 'complete'
      })
      return
    }

    set({
      status: 'idle',
      mascotState: 'complete'
    })
  }
}))
