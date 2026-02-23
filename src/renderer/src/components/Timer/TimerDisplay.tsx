import { usePomodoro } from '../../hooks/usePomodoro'
import { useTimerStore } from '../../store/timerStore'

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

const statusLabel = {
  running: 'Running',
  paused: 'Paused',
  idle: 'Ready'
} as const

export default function TimerDisplay(): React.JSX.Element {
  const timeRemaining = useTimerStore((state) => state.timeRemaining)
  const status = useTimerStore((state) => state.status)
  const { cycleLabel, nextModeLabel } = usePomodoro()

  return (
    <div className="terminal-hud-readout flex w-full max-w-[220px] flex-col items-center gap-1.5 text-center">
      <div className="terminal-time-box mt-1 w-full px-3 py-2 sm:px-4 sm:py-2.5">
        <p className="terminal-time-text text-4xl font-bold leading-none sm:text-5xl">
          {formatTime(timeRemaining)}
        </p>
      </div>
      <p className="mt-1 whitespace-nowrap text-[10px] tracking-[0.05em] text-[var(--terminal-dim)] sm:text-[11px]">
        Cycle {cycleLabel} · Next {nextModeLabel}
      </p>
      <span className="mt-1 inline-flex items-center rounded-full border border-[rgba(217,119,87,0.3)] bg-[rgba(217,119,87,0.1)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--accent-strong)]">
        {statusLabel[status]}
      </span>
    </div>
  )
}
