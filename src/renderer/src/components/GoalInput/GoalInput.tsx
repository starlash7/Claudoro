import { useEffect } from 'react'
import { useTimerStore } from '../../store/timerStore'

const getTodayKey = (): string => {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return `claudoro_goal_${local.toISOString().slice(0, 10)}`
}

export default function GoalInput(): React.JSX.Element {
  const goal = useTimerStore((state) => state.goal)
  const setGoal = useTimerStore((state) => state.setGoal)
  const status = useTimerStore((state) => state.status)

  useEffect(() => {
    const saved = localStorage.getItem(getTodayKey())

    if (saved) {
      setGoal(saved)
    } else {
      setGoal('')
    }
  }, [setGoal])

  return (
    <div className="terminal-card p-3">
      <label className="terminal-kicker mb-2 block" htmlFor="goal-input">
        Today's Goal
      </label>
      <input
        className="terminal-input w-full px-3 py-2 text-sm outline-none transition-colors placeholder:text-[var(--terminal-dim)]"
        id="goal-input"
        onChange={(event) => {
          const nextGoal = event.target.value
          setGoal(nextGoal)
          localStorage.setItem(getTodayKey(), nextGoal)
        }}
        placeholder="e.g. finish API error handling"
        readOnly={status === 'running'}
        type="text"
        value={goal}
      />
      <p className="mt-2 text-[11px] text-[var(--terminal-dim)]">
        {status === 'running'
          ? 'Goal is locked while the timer is running.'
          : 'Keep it short, like a command before starting your session.'}
      </p>
    </div>
  )
}
