import type {
  ExternalOpenPayload,
  GitCommitPayload,
  GitCommitResult,
  NotificationPayload,
  TrayAction,
  TrayStatePayload
} from '../../../shared/constants'

interface ElectronAPI {
  platform: string
  minimizeWindow: () => Promise<boolean>
  closeWindow: () => Promise<boolean>
  showNotification: (payload: NotificationPayload) => Promise<boolean>
  selectDirectory: () => Promise<string | null>
  commitChanges: (payload: GitCommitPayload) => Promise<GitCommitResult>
  openExternal: (payload: ExternalOpenPayload) => Promise<boolean>
  updateTrayState: (payload: TrayStatePayload) => Promise<boolean>
  onTrayAction: (listener: (action: TrayAction) => void) => () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
