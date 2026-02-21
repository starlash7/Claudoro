import type { TimerMode } from '../../../../shared/constants'

interface CircularProgressProps {
  mode: TimerMode
  timeRemaining: number
  totalTime: number
  children: React.ReactNode
}

const RADIUS = 136
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const modeColor: Record<TimerMode, string> = {
  pomodoro: '#e94560',
  shortBreak: '#3ecf8e',
  longBreak: '#a889ff',
  deepFocus: '#ff9f43'
}

export default function CircularProgress({
  mode,
  timeRemaining,
  totalTime,
  children
}: CircularProgressProps): React.JSX.Element {
  const progress =
    mode === 'deepFocus' || totalTime === 0
      ? 1
      : Math.max(0, Math.min(1, (totalTime - timeRemaining) / totalTime))

  const strokeOffset = CIRCUMFERENCE * (1 - progress)

  return (
    <div className="relative h-[320px] w-[320px]">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 320 320">
        <circle
          cx="160"
          cy="160"
          fill="none"
          r={RADIUS}
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="12"
        />
        <circle
          cx="160"
          cy="160"
          fill="none"
          r={RADIUS}
          stroke={modeColor[mode]}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeOffset}
          strokeLinecap="round"
          strokeWidth="12"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}
