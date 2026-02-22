import { contextBridge, ipcRenderer } from 'electron'
import {
  type ExternalOpenPayload,
  IPC_CHANNELS,
  type GitCommitPayload,
  type GitCommitResult,
  type NotificationPayload
} from '../shared/constants'

export interface ElectronAPI {
  platform: NodeJS.Platform
  minimizeWindow: () => Promise<boolean>
  closeWindow: () => Promise<boolean>
  showNotification: (payload: NotificationPayload) => Promise<boolean>
  selectDirectory: () => Promise<string | null>
  commitChanges: (payload: GitCommitPayload) => Promise<GitCommitResult>
  openExternal: (payload: ExternalOpenPayload) => Promise<boolean>
}

const electronAPI: ElectronAPI = {
  platform: process.platform,
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
  showNotification: (payload) => ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_SHOW, payload),
  openExternal: (payload) => ipcRenderer.invoke(IPC_CHANNELS.EXTERNAL_OPEN, payload),
  selectDirectory: () => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SELECT_DIRECTORY),
  commitChanges: (payload) => ipcRenderer.invoke(IPC_CHANNELS.GIT_COMMIT, payload)
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
