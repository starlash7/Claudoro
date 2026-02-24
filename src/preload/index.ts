import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import {
  type AppLogPayload,
  type ExternalOpenPayload,
  IPC_CHANNELS,
  type GitCommitPayload,
  type GitCommitResult,
  type NotificationPayload,
  type TrayAction,
  type TrayStatePayload
} from '../shared/constants'

export interface ElectronAPI {
  platform: NodeJS.Platform
  minimizeWindow: () => Promise<boolean>
  closeWindow: () => Promise<boolean>
  showNotification: (payload: NotificationPayload) => Promise<boolean>
  selectDirectory: () => Promise<string | null>
  commitChanges: (payload: GitCommitPayload) => Promise<GitCommitResult>
  openExternal: (payload: ExternalOpenPayload) => Promise<boolean>
  appendLog: (payload: AppLogPayload) => Promise<boolean>
  updateTrayState: (payload: TrayStatePayload) => Promise<boolean>
  onTrayAction: (listener: (action: TrayAction) => void) => () => void
}

const electronAPI: ElectronAPI = {
  platform: process.platform,
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
  showNotification: (payload) => ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_SHOW, payload),
  openExternal: (payload) => ipcRenderer.invoke(IPC_CHANNELS.EXTERNAL_OPEN, payload),
  appendLog: (payload) => ipcRenderer.invoke(IPC_CHANNELS.APP_LOG_APPEND, payload),
  updateTrayState: (payload) => ipcRenderer.invoke(IPC_CHANNELS.TRAY_UPDATE_STATE, payload),
  onTrayAction: (listener) => {
    const wrapped = (_event: IpcRendererEvent, action: TrayAction): void => {
      listener(action)
    }

    ipcRenderer.on(IPC_CHANNELS.TRAY_ACTION, wrapped)

    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.TRAY_ACTION, wrapped)
    }
  },
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
