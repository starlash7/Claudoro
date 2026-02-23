import { useState } from 'react'
import { ExternalLink, Music4, PlayCircle } from 'lucide-react'

const CUSTOM_URL_STORAGE_KEY = 'claudoro_custom_media_url'

const quickLinks = [
  {
    id: 'spotify-focus',
    label: 'Spotify Focus',
    url: 'https://open.spotify.com/genre/focus'
  },
  {
    id: 'youtube-lofi',
    label: 'YouTube Lo-fi',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk'
  }
]

export default function MediaLauncher(): React.JSX.Element {
  const [customUrl, setCustomUrl] = useState(() => {
    return localStorage.getItem(CUSTOM_URL_STORAGE_KEY) ?? ''
  })
  const [status, setStatus] = useState('')

  const handleOpenLink = async (url: string, label: string): Promise<void> => {
    const success = await window.electronAPI.openExternal({ url })

    if (!success) {
      setStatus(`Failed to open: ${label}`)
      return
    }

    setStatus(`Opened: ${label}`)
  }

  return (
    <section className="terminal-card p-3">
      <div className="terminal-section-title mb-2">
        <Music4 size={16} />
        Music
      </div>

      <div className="grid grid-cols-2 gap-2">
        {quickLinks.map((item) => (
          <button
            className="terminal-btn terminal-btn-secondary px-3 py-2 text-left"
            key={item.id}
            onClick={() => {
              void handleOpenLink(item.url, item.label)
            }}
            type="button"
          >
            <span className="flex items-center justify-between gap-2">
              {item.label}
              <ExternalLink size={13} />
            </span>
          </button>
        ))}
      </div>

      <div className="terminal-soft-card mt-3 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
        <p className="terminal-kicker">Custom URL</p>
        <div className="mt-2 flex gap-2">
          <input
            className="terminal-input w-full px-2.5 py-2 text-xs outline-none transition-colors placeholder:text-[var(--terminal-dim)]"
            onChange={(event) => {
              const value = event.target.value
              setCustomUrl(value)
              localStorage.setItem(CUSTOM_URL_STORAGE_KEY, value)
            }}
            placeholder="https://open.spotify.com/... or https://youtube.com/..."
            type="url"
            value={customUrl}
          />
          <button
            className="terminal-btn terminal-btn-primary px-3"
            disabled={!customUrl.trim()}
            onClick={() => {
              void handleOpenLink(customUrl, 'Custom URL')
            }}
            type="button"
          >
            <PlayCircle size={14} />
          </button>
        </div>
      </div>

      <div className="mt-2 min-h-4 text-[11px] text-[var(--terminal-muted)]">{status}</div>
    </section>
  )
}
