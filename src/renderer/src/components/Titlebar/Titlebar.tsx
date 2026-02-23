import { Minus, X } from 'lucide-react'

export default function Titlebar(): React.JSX.Element {
  const isMac = window.electronAPI.platform === 'darwin'

  const macWindowControls = (
    <div className="no-drag flex items-center gap-2">
      <button
        aria-label="Close window"
        className="terminal-window-dot terminal-window-dot-accent"
        onClick={() => {
          void window.electronAPI.closeWindow()
        }}
        type="button"
      >
        <X size={8} />
      </button>
      <button
        aria-label="Minimize window"
        className="terminal-window-dot terminal-window-dot-light"
        onClick={() => {
          void window.electronAPI.minimizeWindow()
        }}
        type="button"
      >
        <Minus size={8} />
      </button>
    </div>
  )

  const desktopWindowControls = (
    <div className="no-drag flex items-center gap-1.5">
      <button
        aria-label="Minimize window"
        className="terminal-window-btn"
        onClick={() => {
          void window.electronAPI.minimizeWindow()
        }}
        type="button"
      >
        <Minus size={13} />
        <span>[MIN]</span>
      </button>
      <button
        aria-label="Close window"
        className="terminal-window-btn"
        onClick={() => {
          void window.electronAPI.closeWindow()
        }}
        type="button"
      >
        <X size={13} />
        <span>[CLOSE]</span>
      </button>
    </div>
  )

  return (
    <header className="titlebar grid h-12 grid-cols-[1fr_auto_1fr] items-center border-b border-[var(--terminal-border)] px-3 sm:px-4">
      <div className="flex items-center">{isMac ? macWindowControls : <div />}</div>

      <div className="terminal-app-title">Claudoro</div>

      <div className="flex items-center justify-end">
        {!isMac ? desktopWindowControls : <div />}
      </div>
    </header>
  )
}
