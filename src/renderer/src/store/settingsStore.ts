import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const SETTINGS_STORAGE_KEY = 'claudoro_settings'

export interface GitHubSettings {
  githubToken: string
  githubUsername: string
  githubRepo: string
  localRepoPath: string
  isGitHubEnabled: boolean
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
  isGitHubEnabled: false
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
          isGitHubEnabled: getEnabledState(next)
        })
      },
      setGitHubUsername: (username) => {
        const next = {
          ...get(),
          githubUsername: username.trim()
        }

        set({
          githubUsername: next.githubUsername,
          isGitHubEnabled: getEnabledState(next)
        })
      },
      setGitHubRepo: (repo) => {
        const next = {
          ...get(),
          githubRepo: repo.trim()
        }

        set({
          githubRepo: next.githubRepo,
          isGitHubEnabled: getEnabledState(next)
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
        const next = {
          ...get(),
          ...settings,
          githubToken: settings.githubToken?.trim() ?? get().githubToken,
          githubUsername: settings.githubUsername?.trim() ?? get().githubUsername,
          githubRepo: settings.githubRepo?.trim() ?? get().githubRepo,
          localRepoPath: settings.localRepoPath?.trim() ?? get().localRepoPath
        }

        set({
          ...next,
          isGitHubEnabled: getEnabledState(next)
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
        isGitHubEnabled: state.isGitHubEnabled
      })
    }
  )
)
