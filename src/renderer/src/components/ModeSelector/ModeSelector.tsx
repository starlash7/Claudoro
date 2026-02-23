import { TIMER_MODES, type TimerMode } from '../../../../shared/constants'
import { useTimerStore } from '../../store/timerStore'

const modeLabels: Record<TimerMode, string> = {
  pomodoro: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
  deepFocus: 'Deep Focus'
}

export default function ModeSelector(): React.JSX.Element {
  const mode = useTimerStore((state) => state.mode)
  const setMode = useTimerStore((state) => state.setMode)

  return (
    <div className="terminal-card grid grid-cols-2 gap-2 p-2 sm:grid-cols-4">
      {TIMER_MODES.map((targetMode) => {
        const isActive = targetMode === mode

        return (
          <button
            className={`rounded-[9px] border px-2 py-2 text-[11px] font-semibold tracking-[0.04em] transition-colors sm:text-[12px] ${
              isActive
                ? 'border-[var(--accent)] bg-[rgba(217,119,87,0.14)] text-[var(--accent-strong)] shadow-[inset_0_0_0_1px_rgba(217,119,87,0.22)]'
                : 'border-[var(--terminal-border-soft)] bg-white text-[var(--terminal-muted)] hover:border-[var(--terminal-border)] hover:bg-[rgba(217,119,87,0.07)] hover:text-[var(--terminal-text)]'
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
