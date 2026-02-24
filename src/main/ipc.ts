import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { BrowserWindow, Notification, dialog, ipcMain, shell } from 'electron'
import { appendAppLog } from './logger'
import {
  type AppLogPayload,
  type ExternalOpenPayload,
  type GitCommitPayload,
  type GitCommitResult,
  IPC_CHANNELS,
  type NotificationPayload,
  type TrayStatePayload
} from '../shared/constants'

const execFileAsync = promisify(execFile)

interface RegisterIpcHandlersOptions {
  getMainWindow: () => BrowserWindow | null
  onTrayStateUpdate?: (payload: TrayStatePayload) => void
}

export const registerIpcHandlers = ({
  getMainWindow,
  onTrayStateUpdate
}: RegisterIpcHandlersOptions): void => {
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

    // Hide the window instead of quitting so tray mode keeps the app alive.
    mainWindow.hide()
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

  ipcMain.handle(IPC_CHANNELS.EXTERNAL_OPEN, async (_, payload: ExternalOpenPayload) => {
    const rawUrl = payload.url.trim()

    if (!rawUrl) {
      return false
    }

    try {
      const parsed = new URL(rawUrl)
      const allowedProtocols = new Set(['https:', 'http:', 'spotify:'])

      if (!allowedProtocols.has(parsed.protocol)) {
        return false
      }

      await shell.openExternal(parsed.toString())
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle(IPC_CHANNELS.TRAY_UPDATE_STATE, (_, payload: TrayStatePayload) => {
    onTrayStateUpdate?.(payload)
    return true
  })

  ipcMain.handle(IPC_CHANNELS.APP_LOG_APPEND, (_, payload: AppLogPayload) => {
    appendAppLog(payload)
    return true
  })

  ipcMain.handle(IPC_CHANNELS.DIALOG_SELECT_DIRECTORY, async () => {
    const mainWindow = getMainWindow()
    const result = mainWindow
      ? await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] })
      : await dialog.showOpenDialog({ properties: ['openDirectory'] })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return result.filePaths[0]
  })

  ipcMain.handle(
    IPC_CHANNELS.GIT_COMMIT,
    async (_, payload: GitCommitPayload): Promise<GitCommitResult> => {
      const repoPath = payload.repoPath.trim()
      const message = payload.message.trim()

      if (!repoPath) {
        return {
          success: false,
          message: 'Local repository path is empty.'
        }
      }

      if (!message) {
        return {
          success: false,
          message: 'Please enter a commit message.'
        }
      }

      try {
        const { stdout, stderr } = await execFileAsync(
          'git',
          ['-C', repoPath, 'commit', '-m', message],
          {
            timeout: 60_000
          }
        )

        return {
          success: true,
          message: 'Commit completed.',
          stdout,
          stderr
        }
      } catch (error) {
        const failed = error as { stdout?: string; stderr?: string; message?: string }
        return {
          success: false,
          message: failed.stderr?.trim() || failed.message || 'Commit failed.',
          stdout: failed.stdout,
          stderr: failed.stderr
        }
      }
    }
  )
}
