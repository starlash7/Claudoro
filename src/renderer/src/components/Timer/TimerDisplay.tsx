import { usePomodoro } from '../../hooks/usePomodoro'
import { useTimerStore } from '../../store/timerStore'

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

const modeTitles = {
  pomodoro: '집중 시간',
  shortBreak: '짧은 휴식',
  longBreak: '긴 휴식',
  deepFocus: 'Deep Focus'
} as const

export default function TimerDisplay(): React.JSX.Element {
  const mode = useTimerStore((state) => state.mode)
  const timeRemaining = useTimerStore((state) => state.timeRemaining)
  const status = useTimerStore((state) => state.status)
  const { cycleLabel, nextModeLabel } = usePomodoro()

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
        {modeTitles[mode]}
      </p>
      <p className="font-mono text-6xl font-bold leading-none tracking-tight text-white">
        {formatTime(timeRemaining)}
      </p>
      <p className="text-xs text-white/60">
        사이클 {cycleLabel} · 다음 {nextModeLabel}
      </p>
      <p className="text-xs text-white/45">
        {status === 'running' ? 'Running' : status === 'paused' ? 'Paused' : 'Ready'}
      </p>
    </div>
  )
}
