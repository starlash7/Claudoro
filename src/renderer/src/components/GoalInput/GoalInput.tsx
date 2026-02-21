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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <label
        className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/65"
        htmlFor="goal-input"
      >
        오늘의 목표
      </label>
      <input
        className="w-full rounded-xl border border-white/12 bg-[#11142a] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[var(--accent)]"
        id="goal-input"
        onChange={(event) => {
          const nextGoal = event.target.value
          setGoal(nextGoal)
          localStorage.setItem(getTodayKey(), nextGoal)
        }}
        placeholder="예: 클라우드 API 에러 처리 구현"
        readOnly={status === 'running'}
        type="text"
        value={goal}
      />
      <p className="mt-2 text-[11px] text-white/45">
        {status === 'running'
          ? '집중 중에는 목표를 잠시 고정합니다.'
          : '세션 시작 전 목표를 명확히 적어두세요.'}
      </p>
    </div>
  )
}
