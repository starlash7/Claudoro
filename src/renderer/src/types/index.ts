import type { NotificationPayload } from '../../../shared/constants'

interface ElectronAPI {
  platform: string
  minimizeWindow: () => Promise<boolean>
  closeWindow: () => Promise<boolean>
  showNotification: (payload: NotificationPayload) => Promise<boolean>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
