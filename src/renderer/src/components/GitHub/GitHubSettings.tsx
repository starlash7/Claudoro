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
        message: '토큰을 먼저 입력해 주세요.'
      })
      return
    }

    setConnectionState({
      status: 'loading',
      message: 'GitHub 연결 테스트 중...'
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
        throw new Error(raw || `연결 실패 (${response.status})`)
      }

      const profile = (await response.json()) as { login?: string }

      if (!username.trim() && profile.login) {
        setUsername(profile.login)
      }

      setConnectionState({
        status: 'success',
        message: `연결 성공: ${profile.login ?? 'GitHub 사용자'}`
      })
    } catch (error) {
      setConnectionState({
        status: 'error',
        message: error instanceof Error ? error.message : '연결 테스트에 실패했습니다.'
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
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#111327] p-4 shadow-2xl shadow-black/40">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/75">
            GitHub 연결 설정
          </h2>
          <button
            className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs text-white/70" htmlFor="github-token">
            Token
            <input
              className="mt-1 w-full rounded-xl border border-white/12 bg-[#0b0e1f] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[var(--accent)]"
              id="github-token"
              onChange={(event) => {
                setToken(event.target.value)
              }}
              placeholder="ghp_xxx"
              type="password"
              value={token}
            />
          </label>

          <label className="block text-xs text-white/70" htmlFor="github-username">
            Username
            <input
              className="mt-1 w-full rounded-xl border border-white/12 bg-[#0b0e1f] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[var(--accent)]"
              id="github-username"
              onChange={(event) => {
                setUsername(event.target.value)
              }}
              placeholder="starlash7"
              type="text"
              value={username}
            />
          </label>

          <label className="block text-xs text-white/70" htmlFor="github-repo">
            Repository
            <input
              className="mt-1 w-full rounded-xl border border-white/12 bg-[#0b0e1f] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[var(--accent)]"
              id="github-repo"
              onChange={(event) => {
                setRepo(event.target.value)
              }}
              placeholder="Claudoro"
              type="text"
              value={repo}
            />
          </label>

          <label className="block text-xs text-white/70" htmlFor="github-local-path">
            Local Repository Path
            <div className="mt-1 flex gap-2">
              <input
                className="w-full rounded-xl border border-white/12 bg-[#0b0e1f] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[var(--accent)]"
                id="github-local-path"
                onChange={(event) => {
                  setRepoPath(event.target.value)
                }}
                placeholder="/Users/.../repo"
                type="text"
                value={repoPath}
              />
              <button
                className="rounded-xl border border-white/15 bg-white/5 px-3 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                onClick={() => {
                  void handlePickDirectory()
                }}
                title="폴더 선택"
                type="button"
              >
                <FolderOpen size={16} />
              </button>
            </div>
          </label>
        </div>

        <div className="mt-3 h-5 text-xs">
          {connectionState.message ? (
            <p
              className={
                connectionState.status === 'success'
                  ? 'text-emerald-300'
                  : connectionState.status === 'error'
                    ? 'text-rose-300'
                    : 'text-white/60'
              }
            >
              {connectionState.message}
            </p>
          ) : null}
        </div>

        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            onClick={() => {
              void handleConnectionTest()
            }}
            type="button"
          >
            <span className="flex items-center gap-1.5">
              <TestTubeDiagonal size={14} /> 연결 테스트
            </span>
          </button>

          <button
            className="rounded-xl bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!canSave || connectionState.status === 'loading'}
            onClick={handleSave}
            type="button"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
