import { useEffect, useState } from 'react'
import Titlebar from './components/Titlebar/Titlebar'
import GoalInput from './components/GoalInput/GoalInput'
import Mascot from './components/Mascot/Mascot'
import ModeSelector from './components/ModeSelector/ModeSelector'
import TimerDisplay from './components/Timer/TimerDisplay'
import Controls from './components/Controls/Controls'
import Stats from './components/Stats/Stats'
import CommitMessageModal from './components/GitHub/CommitMessageModal'
import GitHubWidget from './components/GitHub/GitHubWidget'
import MediaLauncher from './components/Media/MediaLauncher'
import OnboardingModal from './components/Onboarding/OnboardingModal'
import { useAppLogging } from './hooks/useAppLogging'
import { useTimer } from './hooks/useTimer'
import { useTrayIntegration } from './hooks/useTrayIntegration'
import { useAppStore, useShouldShowOnboarding } from './store/appStore'
import { SETTINGS_STORAGE_KEY, useSettingsStore } from './store/settingsStore'
import { useTimerStore } from './store/timerStore'

type LeftMenu = 'timer' | 'streak' | 'music' | 'settings'

const menuItems: Array<{ id: LeftMenu; label: string }> = [
  { id: 'timer', label: 'Timer' },
  { id: 'streak', label: 'Streak' },
  { id: 'music', label: 'Music' },
  { id: 'settings', label: 'Settings' }
]

function App(): React.JSX.Element {
  useTimer()
  useTrayIntegration()
  useAppLogging()

  const [activeMenu, setActiveMenu] = useState<LeftMenu>('timer')
  const [isTokenBootstrapDone, setIsTokenBootstrapDone] = useState(false)
  const recoveryNoticeSeconds = useTimerStore((state) => state.recoveryNoticeSeconds)
  const clearRecoveryNotice = useTimerStore((state) => state.clearRecoveryNotice)
  const shouldShowOnboarding = useShouldShowOnboarding()
  const completeOnboarding = useAppStore((state) => state.completeOnboarding)
  const githubToken = useSettingsStore((state) => state.githubToken)
  const setGitHubToken = useSettingsStore((state) => state.setGitHubToken)

  useEffect(() => {
    if (!recoveryNoticeSeconds) {
      return
    }

    const timeout = window.setTimeout(() => {
      clearRecoveryNotice()
    }, 3200)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [recoveryNoticeSeconds, clearRecoveryNotice])

  useEffect(() => {
    if (isTokenBootstrapDone) {
      return
    }

    let cancelled = false

    const getLegacyTokenFromStorage = (): string => {
      try {
        const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)

        if (!raw) {
          return ''
        }

        const parsed = JSON.parse(raw) as { state?: { githubToken?: string } }
        return parsed.state?.githubToken?.trim() ?? ''
      } catch {
        return ''
      }
    }

    const bootstrapToken = async (): Promise<void> => {
      const secureToken = (await window.electronAPI.getGitHubToken()).trim()

      if (cancelled) {
        return
      }

      if (secureToken) {
        if (secureToken !== githubToken) {
          setGitHubToken(secureToken)
        }
        setIsTokenBootstrapDone(true)
        return
      }

      const legacyToken = githubToken.trim() || getLegacyTokenFromStorage()

      if (!legacyToken) {
        setIsTokenBootstrapDone(true)
        return
      }

      const stored = await window.electronAPI.setGitHubToken(legacyToken)

      if (cancelled) {
        return
      }

      if (stored) {
        setGitHubToken(legacyToken)
      }

      setIsTokenBootstrapDone(true)
    }

    void bootstrapToken()

    return () => {
      cancelled = true
    }
  }, [githubToken, isTokenBootstrapDone, setGitHubToken])

  const recoveredMinutes = recoveryNoticeSeconds
    ? Math.max(1, Math.round(recoveryNoticeSeconds / 60))
    : 0

  return (
    <div className="app-shell flex h-screen flex-col overflow-hidden border border-[var(--terminal-border)] bg-[var(--terminal-bg)] text-[var(--terminal-text)] shadow-[0_0_0_1px_rgba(217,119,87,0.12),0_16px_48px_var(--terminal-shadow)]">
      <Titlebar />

      {recoveryNoticeSeconds ? (
        <div className="pointer-events-none fixed left-1/2 top-14 z-40 -translate-x-1/2">
          <div className="terminal-soft-card border border-[var(--accent)] bg-[rgba(217,119,87,0.12)] px-3 py-1.5 text-xs font-semibold tracking-[0.06em] text-[var(--terminal-text)]">
            {`Recovered after ${recoveredMinutes} min`}
          </div>
        </div>
      ) : null}

      <main className="terminal-scroll flex-1 overflow-y-auto px-3 py-3 sm:px-5 sm:py-4">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
          <aside className="terminal-tab-bar h-fit p-1.5">
            <nav className="grid grid-cols-4 gap-2">
              {menuItems.map((item) => {
                const isActive = item.id === activeMenu

                return (
                  <button
                    className={`terminal-tab w-full px-3 py-2 text-xs font-semibold tracking-[0.08em] ${
                      isActive ? 'terminal-tab-active' : ''
                    }`}
                    key={item.id}
                    onClick={() => {
                      setActiveMenu(item.id)
                    }}
                    type="button"
                  >
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </aside>

          <Mascot />

          <section className="min-w-0">
            {activeMenu === 'timer' ? (
              <section className="space-y-3">
                <GoalInput />
                <ModeSelector />

                <section className="terminal-hud-panel flex flex-col items-center justify-center gap-3 px-3 py-4 sm:px-4">
                  <TimerDisplay />
                  <Controls />
                </section>
              </section>
            ) : null}

            {activeMenu === 'streak' ? (
              <section className="space-y-3">
                <Stats />
              </section>
            ) : null}

            {activeMenu === 'music' ? (
              <section className="space-y-3">
                <MediaLauncher />
              </section>
            ) : null}

            {activeMenu === 'settings' ? (
              <section className="space-y-3">
                <GitHubWidget />
              </section>
            ) : null}
          </section>
        </div>
      </main>

      <footer className="shrink-0 border-t border-[var(--terminal-border-soft)] px-4 py-2">
        <p className="terminal-footer-note text-right">Powered by pixy7</p>
      </footer>

      <CommitMessageModal />
      {shouldShowOnboarding ? (
        <OnboardingModal
          isOpen
          onClose={() => {
            completeOnboarding()
          }}
          onOpenSettings={() => {
            setActiveMenu('settings')
          }}
        />
      ) : null}
    </div>
  )
}

export default App
