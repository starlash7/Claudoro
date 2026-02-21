import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS, type NotificationPayload } from '../shared/constants'

export interface ElectronAPI {
  platform: NodeJS.Platform
  minimizeWindow: () => Promise<boolean>
  closeWindow: () => Promise<boolean>
  showNotification: (payload: NotificationPayload) => Promise<boolean>
}

const electronAPI: ElectronAPI = {
  platform: process.platform,
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
  showNotification: (payload) => ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_SHOW, payload)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  ;(window as unknown as Window & { electronAPI: ElectronAPI }).electronAPI = electronAPI
}
