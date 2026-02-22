import { useState } from 'react'
import { Send, X } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { useTimerStore } from '../../store/timerStore'

export default function CommitMessageModal(): React.JSX.Element | null {
  const isOpen = useTimerStore((state) => state.isCommitPromptOpen)
  const closeCommitPrompt = useTimerStore((state) => state.closeCommitPrompt)
  const localRepoPath = useSettingsStore((state) => state.localRepoPath)

  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) {
    return null
  }

  const handleClose = (): void => {
    setMessage('')
    setStatus('')
    closeCommitPrompt()
  }

  const handleCommit = async (): Promise<void> => {
    if (!localRepoPath.trim()) {
      setStatus('로컬 저장소 경로가 없어 커밋할 수 없습니다. GitHub 설정에서 경로를 지정해 주세요.')
      return
    }

    if (!message.trim()) {
      setStatus('커밋 메시지를 입력해 주세요.')
      return
    }

    setSubmitting(true)
    setStatus('커밋 실행 중...')

    try {
      const result = await window.electronAPI.commitChanges({
        repoPath: localRepoPath,
        message
      })

      if (!result.success) {
        setStatus(result.message)
        return
      }

      setStatus('커밋 완료')
      handleClose()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '커밋 실행에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#101327] p-4 shadow-2xl shadow-black/40">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/80">
            세션 완료 커밋
          </h2>
          <button
            className="rounded-lg p-1.5 text-white/65 transition-colors hover:bg-white/10 hover:text-white"
            onClick={handleClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-white/60">
          집중 세션이 끝났습니다. 바로 커밋 메시지를 남길 수 있습니다.
        </p>
        <p className="mt-1 truncate text-[11px] text-white/40">
          repo: {localRepoPath || '(not configured)'}
        </p>

        <textarea
          className="mt-3 h-24 w-full resize-none rounded-xl border border-white/12 bg-[#0b0e1f] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[var(--accent)]"
          onChange={(event) => {
            setMessage(event.target.value)
          }}
          placeholder="예: feat(timer): add github widget and commit prompt"
          value={message}
        />

        <div className="mt-2 min-h-5 text-xs text-white/60">{status}</div>

        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            onClick={handleClose}
            type="button"
          >
            나중에
          </button>
          <button
            className="rounded-xl bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={submitting}
            onClick={() => {
              void handleCommit()
            }}
            type="button"
          >
            <span className="flex items-center gap-1.5">
              <Send size={14} /> 커밋
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
