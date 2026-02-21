import { BrowserWindow, Notification, ipcMain } from 'electron'
import { IPC_CHANNELS, type NotificationPayload } from '../shared/constants'

export const registerIpcHandlers = (getMainWindow: () => BrowserWindow | null): void => {
  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    const mainWindow = getMainWindow()

    if (!mainWindow || mainWindow.isDestroyed()) {
      return false
    }

    mainWindow.minimize()
    return true
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, () => {
    const mainWindow = getMainWindow()

    if (!mainWindow || mainWindow.isDestroyed()) {
      return false
    }

    mainWindow.close()
    return true
  })

  ipcMain.handle(IPC_CHANNELS.NOTIFICATION_SHOW, (_, payload: NotificationPayload) => {
    if (!Notification.isSupported()) {
      return false
    }

    const notification = new Notification({
      title: payload.title,
      body: payload.body
    })

    notification.show()
    return true
  })
}
