import { Minus, X } from 'lucide-react'

const isMac = window.electronAPI.platform === 'darwin'

export default function Titlebar(): React.JSX.Element {
  return (
    <header className="titlebar flex h-11 items-center justify-between border-b border-[var(--terminal-border)] bg-[rgba(217,119,87,0.08)] px-3">
      {isMac ? (
        <div className="no-drag flex items-center gap-2">
          <button
            aria-label="Close"
            className="h-3 w-3 rounded-[3px] border border-[var(--accent)] bg-[var(--accent)] transition-opacity hover:opacity-80"
            onClick={() => {
              void window.electronAPI.closeWindow()
            }}
            type="button"
          />
          <button
            aria-label="Minimize"
            className="h-3 w-3 rounded-[3px] border border-[var(--terminal-border-soft)] bg-white transition-opacity hover:opacity-80"
            onClick={() => {
              void window.electronAPI.minimizeWindow()
            }}
            type="button"
          />
        </div>
      ) : (
        <div className="flex-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--terminal-muted)]">
          Session
        </div>
      )}

      <div className="text-[12px] font-semibold tracking-[0.08em] text-[var(--accent-strong)]">
        Claudoro
      </div>

      {!isMac ? (
        <div className="no-drag flex items-center gap-1">
          <button
            aria-label="Minimize"
            className="terminal-icon-btn p-1.5"
            onClick={() => {
              void window.electronAPI.minimizeWindow()
            }}
            type="button"
          >
            <Minus size={14} />
          </button>
          <button
            aria-label="Close"
            className="terminal-icon-btn border-[var(--terminal-border)] p-1.5 text-[var(--accent-strong)]"
            onClick={() => {
              void window.electronAPI.closeWindow()
            }}
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="w-14" />
      )}
    </header>
  )
}
