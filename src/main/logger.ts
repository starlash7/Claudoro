import { appendFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { app } from 'electron'
import type { AppLogPayload } from '../shared/constants'

const LOG_DIR_NAME = 'logs'
const LOG_FILE_NAME = 'claudoro.log'

const sanitizeMessage = (value: string): string => {
  return value.replace(/\s+/g, ' ').trim().slice(0, 1500)
}

const sanitizeContext = (context: Record<string, unknown> | undefined): Record<string, unknown> => {
  if (!context) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(context)
      .slice(0, 12)
      .map(([key, value]) => {
        const safeKey = key.slice(0, 48)

        if (typeof value === 'string') {
          return [safeKey, value.slice(0, 240)]
        }

        if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
          return [safeKey, value]
        }

        return [safeKey, String(value).slice(0, 240)]
      })
  )
}

export const getAppLogFilePath = (): string => {
  const logDir = join(app.getPath('userData'), LOG_DIR_NAME)
  mkdirSync(logDir, { recursive: true })
  return join(logDir, LOG_FILE_NAME)
}

export const appendAppLog = (payload: AppLogPayload): void => {
  try {
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      level: payload.level,
      source: payload.source,
      event: payload.event.slice(0, 80),
      message: sanitizeMessage(payload.message),
      context: sanitizeContext(payload.context)
    })

    appendFileSync(getAppLogFilePath(), `${line}\n`, 'utf8')
  } catch {
    // Logging should never crash the app.
  }
}
