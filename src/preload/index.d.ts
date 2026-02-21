import type { NotificationPayload } from '../shared/constants'

export interface ElectronAPI {
  platform: NodeJS.Platform
  minimizeWindow: () => Promise<boolean>
  closeWindow: () => Promise<boolean>
  showNotification: (payload: NotificationPayload) => Promise<boolean>
}
