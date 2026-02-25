import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const SETTINGS_STORAGE_KEY = 'claudoro_settings'
const SETTINGS_STORAGE_VERSION = 3

export type GitHubMode = 'account' | 'repository'

export interface GitHubSettings {
  githubMode: GitHubMode
  githubToken: string
  githubUsername: string
  githubRepo: string
  localRepoPath: string
  isGitHubEnabled: boolean
  githubRepoVerified: boolean
  githubRepoVerifiedAt: number | null
}

interface SettingsState extends GitHubSettings {
  setGitHubMode: (mode: GitHubMode) => void
  setGitHubToken: (token: string) => void
  setGitHubUsername: (username: string) => void
  setGitHubRepo: (repo: string) => void
  setLocalRepoPath: (repoPath: string) => void
  setGitHubEnabled: (enabled: boolean) => void
  updateGitHubSettings: (settings: Partial<GitHubSettings>) => void
  resetGitHubSettings: () => void
}

const defaultSettings: GitHubSettings = {
  githubMode: 'repository',
  githubToken: '',
  githubUsername: '',
  githubRepo: '',
  localRepoPath: '',
  isGitHubEnabled: false,
  githubRepoVerified: false,
  githubRepoVerifiedAt: null
}

const getEnabledState = (settings: Partial<GitHubSettings>): boolean => {
  const mode = settings.githubMode ?? 'repository'
  const hasIdentity = Boolean(settings.githubToken && settings.githubUsername)

  if (!hasIdentity) {
    return false
  }

  return mode === 'repository' ? Boolean(settings.githubRepo) : true
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      setGitHubMode: (mode) => {
        const next = {
          ...get(),
          githubMode: mode
        }

        set({
          githubMode: mode,
          isGitHubEnabled: getEnabledState(next),
          githubRepoVerified: false,
          githubRepoVerifiedAt: null
        })
      },
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
          githubMode: settings.githubMode ?? current.githubMode,
          githubToken: settings.githubToken?.trim() ?? current.githubToken,
          githubUsername: settings.githubUsername?.trim() ?? current.githubUsername,
          githubRepo: settings.githubRepo?.trim() ?? current.githubRepo,
          localRepoPath: settings.localRepoPath?.trim() ?? current.localRepoPath
        }

        const identityChanged =
          current.githubMode !== next.githubMode ||
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
      version: SETTINGS_STORAGE_VERSION,
      migrate: (persistedState) => {
        const state = (persistedState ?? {}) as Partial<GitHubSettings>

        return {
          ...defaultSettings,
          ...state,
          githubMode: state.githubMode ?? 'repository',
          githubToken: state.githubToken ?? '',
          githubRepoVerified: state.githubRepoVerified ?? false,
          githubRepoVerifiedAt: state.githubRepoVerifiedAt ?? null
        }
      },
      partialize: (state) => ({
        githubMode: state.githubMode,
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
