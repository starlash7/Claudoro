import { useEffect } from 'react'
import { useTimerStore } from '../store/timerStore'

export const useTrayIntegration = (): void => {
  const mode = useTimerStore((state) => state.mode)
  const status = useTimerStore((state) => state.status)
  const timeRemaining = useTimerStore((state) => state.timeRemaining)

  useEffect(() => {
    window.electronAPI
      .updateTrayState({
        mode,
        status,
        timeRemaining
      })
      .catch(() => {
        // noop - tray가 없는 환경에서도 동작하도록 무시
      })
  }, [mode, status, timeRemaining])

  useEffect(() => {
    return window.electronAPI.onTrayAction((action) => {
      if (action !== 'toggle-timer') {
        return
      }

      const current = useTimerStore.getState()

      if (current.status === 'running') {
        current.pause()
        return
      }

      current.start()
    })
  }, [])
}
