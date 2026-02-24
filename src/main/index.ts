import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { registerIpcHandlers } from './ipc'
import { appendAppLog } from './logger'
import { createAppTray, destroyAppTray, updateAppTrayState } from './tray'
import { IPC_CHANNELS, type TrayAction } from '../shared/constants'

let mainWindow: BrowserWindow | null = null

const attachProcessErrorHandlers = (): void => {
  process.on('uncaughtException', (error) => {
    appendAppLog({
      level: 'error',
      source: 'main',
      event: 'uncaughtException',
      message: error.message,
      context: {
        stack: error.stack ?? ''
      }
    })
  })

  process.on('unhandledRejection', (reason) => {
    appendAppLog({
      level: 'error',
      source: 'main',
      event: 'unhandledRejection',
      message: reason instanceof Error ? reason.message : String(reason),
      context: {
        reason: reason instanceof Error ? (reason.stack ?? reason.message) : String(reason)
      }
    })
  })
}

const createWindow = (): BrowserWindow => {
  const window = new BrowserWindow({
    width: 520,
    height: 760,
    minWidth: 420,
    minHeight: 680,
    frame: false,
    resizable: true,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  window.on('ready-to-show', () => {
    window.show()
  })

  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  window.webContents.on('render-process-gone', (_event, details) => {
    appendAppLog({
      level: 'error',
      source: 'main',
      event: 'render-process-gone',
      message: 'Renderer process exited unexpectedly.',
      context: {
        reason: details.reason,
        exitCode: details.exitCode
      }
    })
  })

  window.on('unresponsive', () => {
    appendAppLog({
      level: 'warn',
      source: 'main',
      event: 'window-unresponsive',
      message: 'Main window became unresponsive.'
    })
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return window
}

const showMainWindow = (): void => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = createWindow()
    return
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }

  mainWindow.show()
  mainWindow.focus()
}

const emitTrayAction = (action: TrayAction): void => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return
  }

  mainWindow.webContents.send(IPC_CHANNELS.TRAY_ACTION, action)
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.claudoro.app')
  appendAppLog({
    level: 'info',
    source: 'main',
    event: 'app-ready',
    message: 'Claudoro app is ready.'
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  mainWindow = createWindow()

  const trayHandlers = {
    onOpen: () => {
      showMainWindow()
    },
    onToggleTimer: () => {
      emitTrayAction('toggle-timer')
    },
    onQuit: () => {
      app.quit()
    }
  }

  createAppTray(trayHandlers)

  registerIpcHandlers({
    getMainWindow: () => mainWindow,
    onTrayStateUpdate: (payload) => {
      updateAppTrayState(payload, trayHandlers)
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow()
      return
    }

    showMainWindow()
  })
})

app.on('before-quit', () => {
  appendAppLog({
    level: 'info',
    source: 'main',
    event: 'before-quit',
    message: 'App is quitting.'
  })
  destroyAppTray()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

attachProcessErrorHandlers()
