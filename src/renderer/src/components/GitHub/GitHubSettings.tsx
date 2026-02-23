import { useEffect, useState } from 'react'
import { FolderOpen, TestTubeDiagonal, X } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'

interface GitHubSettingsProps {
  isOpen: boolean
  onClose: () => void
}

type ConnectionState =
  | { status: 'idle'; message: string }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }
  | { status: 'loading'; message: string }

export default function GitHubSettings({
  isOpen,
  onClose
}: GitHubSettingsProps): React.JSX.Element | null {
  const storedToken = useSettingsStore((state) => state.githubToken)
  const storedUsername = useSettingsStore((state) => state.githubUsername)
  const storedRepo = useSettingsStore((state) => state.githubRepo)
  const storedRepoPath = useSettingsStore((state) => state.localRepoPath)
  const updateGitHubSettings = useSettingsStore((state) => state.updateGitHubSettings)

  const [token, setToken] = useState('')
  const [username, setUsername] = useState('')
  const [repo, setRepo] = useState('')
  const [repoPath, setRepoPath] = useState('')
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'idle',
    message: ''
  })

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setToken(storedToken)
    setUsername(storedUsername)
    setRepo(storedRepo)
    setRepoPath(storedRepoPath)
    setConnectionState({
      status: 'idle',
      message: ''
    })
  }, [isOpen, storedToken, storedUsername, storedRepo, storedRepoPath])

  if (!isOpen) {
    return null
  }

  const handlePickDirectory = async (): Promise<void> => {
    const selected = await window.electronAPI.selectDirectory()

    if (!selected) {
      return
    }

    setRepoPath(selected)
  }

  const handleConnectionTest = async (): Promise<void> => {
    const trimmedToken = token.trim()

    if (!trimmedToken) {
      setConnectionState({
        status: 'error',
        message: 'Please enter a token first.'
      })
      return
    }

    setConnectionState({
      status: 'loading',
      message: 'Testing GitHub connection...'
    })

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${trimmedToken}`
        }
      })

      if (!response.ok) {
        const raw = await response.text()
        throw new Error(raw || `Connection failed (${response.status})`)
      }

      const profile = (await response.json()) as { login?: string }

      if (!username.trim() && profile.login) {
        setUsername(profile.login)
      }

      setConnectionState({
        status: 'success',
        message: `Connected: ${profile.login ?? 'GitHub user'}`
      })
    } catch (error) {
      setConnectionState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection test failed.'
      })
    }
  }

  const handleSave = (): void => {
    updateGitHubSettings({
      githubToken: token,
      githubUsername: username,
      githubRepo: repo,
      localRepoPath: repoPath
    })
    onClose()
  }

  const canSave = Boolean(token.trim() && username.trim() && repo.trim())

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(250,245,240,0.8)] px-4 py-6 backdrop-blur-sm">
      <div className="terminal-modal w-full max-w-md p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="terminal-section-title">GitHub Settings</h2>
          <button className="terminal-icon-btn p-1.5" onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs text-[var(--terminal-muted)]" htmlFor="github-token">
            Token
            <input
              className="terminal-input mt-1 w-full px-3 py-2 text-sm outline-none transition-colors"
              id="github-token"
              onChange={(event) => {
                setToken(event.target.value)
              }}
              placeholder="ghp_xxx"
              type="password"
              value={token}
            />
          </label>

          <label className="block text-xs text-[var(--terminal-muted)]" htmlFor="github-username">
            Username
            <input
              className="terminal-input mt-1 w-full px-3 py-2 text-sm outline-none transition-colors"
              id="github-username"
              onChange={(event) => {
                setUsername(event.target.value)
              }}
              placeholder="starlash7"
              type="text"
              value={username}
            />
          </label>

          <label className="block text-xs text-[var(--terminal-muted)]" htmlFor="github-repo">
            Repository
            <input
              className="terminal-input mt-1 w-full px-3 py-2 text-sm outline-none transition-colors"
              id="github-repo"
              onChange={(event) => {
                setRepo(event.target.value)
              }}
              placeholder="Claudoro"
              type="text"
              value={repo}
            />
          </label>

          <label className="block text-xs text-[var(--terminal-muted)]" htmlFor="github-local-path">
            Local Repository Path
            <div className="mt-1 flex gap-2">
              <input
                className="terminal-input w-full px-3 py-2 text-sm outline-none transition-colors"
                id="github-local-path"
                onChange={(event) => {
                  setRepoPath(event.target.value)
                }}
                placeholder="/Users/.../repo"
                type="text"
                value={repoPath}
              />
              <button
                className="terminal-icon-btn px-3"
                onClick={() => {
                  void handlePickDirectory()
                }}
                title="Select folder"
                type="button"
              >
                <FolderOpen size={16} />
              </button>
            </div>
          </label>
        </div>

        <div className="mt-3 min-h-5 text-xs">
          {connectionState.message ? (
            <p
              className={
                connectionState.status === 'success'
                  ? 'text-[var(--accent-strong)]'
                  : connectionState.status === 'error'
                    ? 'text-[var(--accent-strong)]'
                    : 'text-[var(--terminal-muted)]'
              }
            >
              {connectionState.message}
            </p>
          ) : null}
        </div>

        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            className="terminal-btn terminal-btn-secondary"
            onClick={() => {
              void handleConnectionTest()
            }}
            type="button"
          >
            <span className="flex items-center gap-1.5">
              <TestTubeDiagonal size={14} /> Test Connection
            </span>
          </button>

          <button
            className="terminal-btn terminal-btn-primary"
            disabled={!canSave || connectionState.status === 'loading'}
            onClick={handleSave}
            type="button"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
