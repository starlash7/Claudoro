import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const SETTINGS_STORAGE_KEY = 'claudoro_settings'

export interface GitHubSettings {
  githubToken: string
  githubUsername: string
  githubRepo: string
  localRepoPath: string
  isGitHubEnabled: boolean
  githubRepoVerified: boolean
  githubRepoVerifiedAt: number | null
}

interface SettingsState extends GitHubSettings {
  setGitHubToken: (token: string) => void
  setGitHubUsername: (username: string) => void
  setGitHubRepo: (repo: string) => void
  setLocalRepoPath: (repoPath: string) => void
  setGitHubEnabled: (enabled: boolean) => void
  updateGitHubSettings: (settings: Partial<GitHubSettings>) => void
  resetGitHubSettings: () => void
}

const defaultSettings: GitHubSettings = {
  githubToken: '',
  githubUsername: '',
  githubRepo: '',
  localRepoPath: '',
  isGitHubEnabled: false,
  githubRepoVerified: false,
  githubRepoVerifiedAt: null
}

const getEnabledState = (settings: Partial<GitHubSettings>): boolean => {
  return Boolean(settings.githubToken && settings.githubUsername && settings.githubRepo)
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      setGitHubToken: (token) => {
        const next = {
          ...get(),
          githubToken: token.trim()
        }

        set({
          githubToken: next.githubToken,
          isGitHubEnabled: getEnabledState(next),
          githubRepoVerified: false,
          githubRepoVerifiedAt: null
        })
      },
      setGitHubUsername: (username) => {
        const next = {
          ...get(),
          githubUsername: username.trim()
        }

        set({
          githubUsername: next.githubUsername,
          isGitHubEnabled: getEnabledState(next),
          githubRepoVerified: false,
          githubRepoVerifiedAt: null
        })
      },
      setGitHubRepo: (repo) => {
        const next = {
          ...get(),
          githubRepo: repo.trim()
        }

        set({
          githubRepo: next.githubRepo,
          isGitHubEnabled: getEnabledState(next),
          githubRepoVerified: false,
          githubRepoVerifiedAt: null
        })
      },
      setLocalRepoPath: (repoPath) => {
        set({
          localRepoPath: repoPath.trim()
        })
      },
      setGitHubEnabled: (enabled) => {
        set({ isGitHubEnabled: enabled })
      },
      updateGitHubSettings: (settings) => {
        const current = get()
        const next = {
          ...current,
          ...settings,
          githubToken: settings.githubToken?.trim() ?? current.githubToken,
          githubUsername: settings.githubUsername?.trim() ?? current.githubUsername,
          githubRepo: settings.githubRepo?.trim() ?? current.githubRepo,
          localRepoPath: settings.localRepoPath?.trim() ?? current.localRepoPath
        }

        const identityChanged =
          current.githubToken !== next.githubToken ||
          current.githubUsername !== next.githubUsername ||
          current.githubRepo !== next.githubRepo

        const hasVerificationUpdate = typeof settings.githubRepoVerified === 'boolean'

        let githubRepoVerified = current.githubRepoVerified
        let githubRepoVerifiedAt = current.githubRepoVerifiedAt

        if (hasVerificationUpdate) {
          githubRepoVerified = settings.githubRepoVerified ?? false
          githubRepoVerifiedAt = githubRepoVerified
            ? (settings.githubRepoVerifiedAt ?? Date.now())
            : null
        } else if (identityChanged) {
          githubRepoVerified = false
          githubRepoVerifiedAt = null
        }

        set({
          ...next,
          isGitHubEnabled: getEnabledState(next),
          githubRepoVerified,
          githubRepoVerifiedAt
        })
      },
      resetGitHubSettings: () => {
        set(defaultSettings)
      }
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      partialize: (state) => ({
        githubToken: state.githubToken,
        githubUsername: state.githubUsername,
        githubRepo: state.githubRepo,
        localRepoPath: state.localRepoPath,
        isGitHubEnabled: state.isGitHubEnabled,
        githubRepoVerified: state.githubRepoVerified,
        githubRepoVerifiedAt: state.githubRepoVerifiedAt
      })
    }
  )
)
