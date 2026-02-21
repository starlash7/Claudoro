import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import { usePomodoro } from '../../hooks/usePomodoro'
import { useTimerStore } from '../../store/timerStore'

export default function Controls(): React.JSX.Element {
  const status = useTimerStore((state) => state.status)
  const start = useTimerStore((state) => state.start)
  const pause = useTimerStore((state) => state.pause)
  const reset = useTimerStore((state) => state.reset)
  const { skipToNext } = usePomodoro()

  const isRunning = status === 'running'

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        aria-label={isRunning ? '일시정지' : '시작'}
        className="rounded-xl bg-[var(--accent)] px-5 py-3 text-white transition-opacity hover:opacity-90"
        onClick={() => {
          if (isRunning) {
            pause()
            return
          }

          start()
        }}
        type="button"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          {isRunning ? 'Pause' : 'Start'}
        </span>
      </button>

      <button
        aria-label="리셋"
        className="rounded-xl border border-white/15 bg-white/5 p-3 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        onClick={() => {
          reset()
        }}
        type="button"
      >
        <RotateCcw size={18} />
      </button>

      <button
        aria-label="스킵"
        className="rounded-xl border border-white/15 bg-white/5 p-3 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        onClick={() => {
          skipToNext()
        }}
        type="button"
      >
        <SkipForward size={18} />
      </button>
    </div>
  )
}
