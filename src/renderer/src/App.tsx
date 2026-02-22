import Titlebar from './components/Titlebar/Titlebar'
import GoalInput from './components/GoalInput/GoalInput'
import Mascot from './components/Mascot/Mascot'
import ModeSelector from './components/ModeSelector/ModeSelector'
import CircularProgress from './components/Timer/CircularProgress'
import TimerDisplay from './components/Timer/TimerDisplay'
import Controls from './components/Controls/Controls'
import Stats from './components/Stats/Stats'
import CommitMessageModal from './components/GitHub/CommitMessageModal'
import GitHubWidget from './components/GitHub/GitHubWidget'
import MediaLauncher from './components/Media/MediaLauncher'
import { useTimerStore } from './store/timerStore'
import { useTimer } from './hooks/useTimer'

function App(): React.JSX.Element {
  useTimer()

  const mode = useTimerStore((state) => state.mode)
  const timeRemaining = useTimerStore((state) => state.timeRemaining)
  const totalTime = useTimerStore((state) => state.totalTime)

  return (
    <div className="app-shell flex h-screen flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--bg-primary)] text-white shadow-2xl shadow-black/40">
      <Titlebar />

      <main className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        <GoalInput />
        <Mascot />
        <ModeSelector />

        <section className="flex items-center justify-center">
          <CircularProgress mode={mode} timeRemaining={timeRemaining} totalTime={totalTime}>
            <TimerDisplay />
          </CircularProgress>
        </section>

        <Controls />
        <Stats />
        <MediaLauncher />
        <GitHubWidget />
      </main>

      <CommitMessageModal />
    </div>
  )
}

export default App
