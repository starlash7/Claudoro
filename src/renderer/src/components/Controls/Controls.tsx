import { Check, Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import { usePomodoro } from '../../hooks/usePomodoro'
import { useStats } from '../../hooks/useStats'
import { useTimerStore } from '../../store/timerStore'

export default function Controls(): React.JSX.Element {
  const mode = useTimerStore((state) => state.mode)
  const status = useTimerStore((state) => state.status)
  const timeRemaining = useTimerStore((state) => state.timeRemaining)
  const start = useTimerStore((state) => state.start)
  const pause = useTimerStore((state) => state.pause)
  const reset = useTimerStore((state) => state.reset)
  const completeSession = useTimerStore((state) => state.completeSession)
  const { skipToNext } = usePomodoro()
  const { recordFocusSession } = useStats()

  const isRunning = status === 'running'
  const isDeepFocus = mode === 'deepFocus'

  const handleCompleteDeepFocus = (): void => {
    if (timeRemaining > 0) {
      recordFocusSession(timeRemaining, { countCompleted: true })
    }

    completeSession()
  }

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

      {isDeepFocus ? (
        <button
          aria-label="세션 완료"
          className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-emerald-200 transition-colors hover:bg-emerald-400/20"
          onClick={handleCompleteDeepFocus}
          type="button"
        >
          <Check size={18} />
        </button>
      ) : (
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
      )}
    </div>
  )
}
