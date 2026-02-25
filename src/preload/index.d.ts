import type {
  AppLogPayload,
  ExternalOpenPayload,
  GitCommitPayload,
  GitCommitResult,
  NotificationPayload,
  TrayAction,
  TrayStatePayload
} from '../shared/constants'

export interface ElectronAPI {
  platform: NodeJS.Platform
  minimizeWindow: () => Promise<boolean>
  closeWindow: () => Promise<boolean>
  getGitHubToken: () => Promise<string>
  setGitHubToken: (token: string) => Promise<boolean>
  clearGitHubToken: () => Promise<boolean>
  showNotification: (payload: NotificationPayload) => Promise<boolean>
  selectDirectory: () => Promise<string | null>
  commitChanges: (payload: GitCommitPayload) => Promise<GitCommitResult>
  openExternal: (payload: ExternalOpenPayload) => Promise<boolean>
  appendLog: (payload: AppLogPayload) => Promise<boolean>
  updateTrayState: (payload: TrayStatePayload) => Promise<boolean>
  onTrayAction: (listener: (action: TrayAction) => void) => () => void
}
