import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { BrowserWindow, Notification, dialog, ipcMain, shell } from 'electron'
import {
  type ExternalOpenPayload,
  IPC_CHANNELS,
  type GitCommitPayload,
  type GitCommitResult,
  type NotificationPayload
} from '../shared/constants'

const execFileAsync = promisify(execFile)

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

  ipcMain.handle(IPC_CHANNELS.EXTERNAL_OPEN, async (_, payload: ExternalOpenPayload) => {
    const rawUrl = payload.url.trim()

    if (!rawUrl) {
      return false
    }

    try {
      const parsed = new URL(rawUrl)

      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return false
      }

      await shell.openExternal(parsed.toString())
      return true
    } catch {
      return false
    }
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
          message: '로컬 저장소 경로가 비어 있습니다.'
        }
      }

      if (!message) {
        return {
          success: false,
          message: '커밋 메시지를 입력해 주세요.'
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
          message: '커밋이 완료되었습니다.',
          stdout,
          stderr
        }
      } catch (error) {
        const failed = error as { stdout?: string; stderr?: string; message?: string }
        return {
          success: false,
          message: failed.stderr?.trim() || failed.message || '커밋 실행에 실패했습니다.',
          stdout: failed.stdout,
          stderr: failed.stderr
        }
      }
    }
  )
}
