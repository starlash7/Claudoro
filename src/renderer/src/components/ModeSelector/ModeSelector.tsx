import { TIMER_MODES, type TimerMode } from '../../../../shared/constants'
import { useTimerStore } from '../../store/timerStore'

const modeLabels: Record<TimerMode, string> = {
  pomodoro: 'Pomodoro',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
  deepFocus: 'Deep Focus'
}

export default function ModeSelector(): React.JSX.Element {
  const mode = useTimerStore((state) => state.mode)
  const setMode = useTimerStore((state) => state.setMode)

  return (
    <div className="grid grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
      {TIMER_MODES.map((targetMode) => {
        const isActive = targetMode === mode

        return (
          <button
            className={`rounded-xl px-2 py-2 text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-[var(--accent)] text-white'
                : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white'
            }`}
            key={targetMode}
            onClick={() => {
              setMode(targetMode)
            }}
            type="button"
          >
            {modeLabels[targetMode]}
          </button>
        )
      })}
    </div>
  )
}
