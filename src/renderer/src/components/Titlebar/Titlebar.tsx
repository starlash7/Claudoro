import { Minus, X } from 'lucide-react'

const isMac = window.electronAPI.platform === 'darwin'

export default function Titlebar(): React.JSX.Element {
  return (
    <header className="titlebar flex h-10 items-center justify-between border-b border-white/10 px-3">
      {isMac ? (
        <div className="no-drag flex items-center gap-2">
          <button
            aria-label="닫기"
            className="h-3 w-3 rounded-full bg-[#ff5f57] transition-opacity hover:opacity-80"
            onClick={() => {
              void window.electronAPI.closeWindow()
            }}
            type="button"
          />
          <button
            aria-label="최소화"
            className="h-3 w-3 rounded-full bg-[#febc2e] transition-opacity hover:opacity-80"
            onClick={() => {
              void window.electronAPI.minimizeWindow()
            }}
            type="button"
          />
        </div>
      ) : (
        <div className="flex-1 text-sm font-semibold tracking-wide text-white/75">CLAUDORO</div>
      )}

      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
        Claudoro
      </div>

      {!isMac ? (
        <div className="no-drag flex items-center gap-1">
          <button
            aria-label="최소화"
            className="rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            onClick={() => {
              void window.electronAPI.minimizeWindow()
            }}
            type="button"
          >
            <Minus size={14} />
          </button>
          <button
            aria-label="닫기"
            className="rounded-md p-1.5 text-white/70 transition-colors hover:bg-[#e94560] hover:text-white"
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
