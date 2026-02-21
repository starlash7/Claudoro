export const TIMER_MODES = ['pomodoro', 'shortBreak', 'longBreak', 'deepFocus'] as const

export type TimerMode = (typeof TIMER_MODES)[number]

export const TIMER_DURATIONS: Record<Exclude<TimerMode, 'deepFocus'>, number> = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
}

export const POMODOROS_BEFORE_LONG_BREAK = 4

export const IPC_CHANNELS = {
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_CLOSE: 'window:close',
  NOTIFICATION_SHOW: 'notification:show'
} as const

export type MascotState = 'idle' | 'focusing' | 'break' | 'complete'
export type TimerStatus = 'idle' | 'running' | 'paused'

export interface NotificationPayload {
  title: string
  body: string
}
