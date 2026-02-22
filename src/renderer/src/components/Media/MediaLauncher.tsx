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
      setStatus(`열기 실패: ${label}`)
      return
    }

    setStatus(`열림: ${label}`)
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/85">
        <Music4 size={16} />
        Spotify / YouTube
      </div>

      <div className="grid grid-cols-2 gap-2">
        {quickLinks.map((item) => (
          <button
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
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

      <div className="mt-3 rounded-xl border border-white/10 bg-[#0f1225] p-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/50">
          Custom URL
        </p>
        <div className="mt-2 flex gap-2">
          <input
            className="w-full rounded-lg border border-white/12 bg-[#0b0e1f] px-2.5 py-2 text-xs text-white outline-none transition-colors placeholder:text-white/35 focus:border-[var(--accent)]"
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
            className="rounded-lg bg-[var(--accent)] px-3 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
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

      <div className="mt-2 min-h-4 text-[11px] text-white/55">{status}</div>
    </section>
  )
}
