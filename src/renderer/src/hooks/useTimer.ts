import { useEffect, useRef } from 'react'
import { TIMER_DURATIONS, type TimerMode } from '../../../shared/constants'
import { useSettingsStore } from '../store/settingsStore'
import { useTimerStore } from '../store/timerStore'
import { useStats } from './useStats'

const getNotificationMessage = (mode: TimerMode): { title: string; body: string } => {
  if (mode === 'pomodoro') {
    return {
      title: 'Pomodoro 완료',
      body: '좋아요. 잠깐 쉬고 다음 집중 세션을 시작해보세요.'
    }
  }

  if (mode === 'shortBreak' || mode === 'longBreak') {
    return {
      title: '휴식 완료',
      body: '다시 집중 모드로 돌아갈 시간입니다.'
    }
  }

  return {
    title: 'Deep Focus 종료',
    body: '수동으로 세션을 종료했습니다.'
  }
}

export const useTimer = (): void => {
  const status = useTimerStore((state) => state.status)
  const mode = useTimerStore((state) => state.mode)
  const timeRemaining = useTimerStore((state) => state.timeRemaining)
  const tick = useTimerStore((state) => state.tick)
  const completeSession = useTimerStore((state) => state.completeSession)
  const openCommitPrompt = useTimerStore((state) => state.openCommitPrompt)
  const recordPomodoroSession = useStats().recordPomodoroSession
  const completionGuard = useRef(false)

  useEffect(() => {
    if (status !== 'running') {
      return
    }

    const interval = window.setInterval(() => {
      tick()
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [status, tick])

  useEffect(() => {
    if (status !== 'running') {
      completionGuard.current = false
      return
    }

    if (mode === 'deepFocus') {
      completionGuard.current = false
      return
    }

    if (timeRemaining > 0) {
      completionGuard.current = false
      return
    }

    if (completionGuard.current) {
      return
    }

    completionGuard.current = true

    if (mode === 'pomodoro') {
      recordPomodoroSession(TIMER_DURATIONS.pomodoro)

      const { isGitHubEnabled, localRepoPath } = useSettingsStore.getState()

      if (isGitHubEnabled && localRepoPath.trim()) {
        openCommitPrompt()
      }
    }

    window.electronAPI.showNotification(getNotificationMessage(mode)).catch(() => {
      // noop - renderer still works without notification support
    })

    completeSession()
  }, [status, mode, timeRemaining, recordPomodoroSession, completeSession, openCommitPrompt])
}
