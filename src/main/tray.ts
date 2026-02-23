import { Menu, Tray, app } from 'electron'
import trayIcon from '../../resources/icon.png?asset'
import { type TrayStatePayload } from '../shared/constants'

interface CreateAppTrayOptions {
  onOpen: () => void
  onToggleTimer: () => void
  onQuit: () => void
}

const defaultTrayState: TrayStatePayload = {
  mode: 'pomodoro',
  status: 'idle',
  timeRemaining: 0
}

let appTray: Tray | null = null
let trayState: TrayStatePayload = defaultTrayState

const formatSeconds = (seconds: number): string => {
  const safe = Math.max(0, seconds)
  const minutes = Math.floor(safe / 60)
  const remain = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(remain).padStart(2, '0')}`
}

const getTrayTitle = (): string => {
  if (trayState.status !== 'running') {
    return ''
  }

  if (trayState.mode === 'deepFocus') {
    return `+${formatSeconds(trayState.timeRemaining)}`
  }

  return formatSeconds(trayState.timeRemaining)
}

const buildContextMenu = ({ onOpen, onToggleTimer, onQuit }: CreateAppTrayOptions): Menu => {
  const toggleLabel = trayState.status === 'running' ? 'Pause Timer' : 'Resume Timer'

  return Menu.buildFromTemplate([
    {
      label: 'Open Claudoro',
      click: onOpen
    },
    {
      label: toggleLabel,
      click: onToggleTimer
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click: onQuit
    }
  ])
}

const applyTrayPresentation = (options: CreateAppTrayOptions): void => {
  if (!appTray) {
    return
  }

  appTray.setContextMenu(buildContextMenu(options))
  appTray.setToolTip('Claudoro Timer')

  if (process.platform === 'darwin') {
    appTray.setTitle(getTrayTitle())
  }
}

export const createAppTray = (options: CreateAppTrayOptions): Tray => {
  if (!appTray) {
    appTray = new Tray(trayIcon)
    appTray.on('click', () => {
      options.onOpen()
    })
  }

  applyTrayPresentation(options)
  return appTray
}

export const updateAppTrayState = (
  nextState: TrayStatePayload,
  options: CreateAppTrayOptions
): void => {
  trayState = nextState
  applyTrayPresentation(options)
}

export const destroyAppTray = (): void => {
  if (!appTray) {
    return
  }

  if (process.platform === 'darwin') {
    appTray.setTitle('')
  }

  appTray.destroy()
  appTray = null
}

export const ensureTrayForApp = (options: CreateAppTrayOptions): void => {
  if (!app.isReady()) {
    return
  }

  createAppTray(options)
}
