import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { app, safeStorage } from 'electron'
import { appendAppLog } from './logger'

const SERVICE_NAME = 'com.claudoro.app'
const GITHUB_TOKEN_ACCOUNT = 'github-token'
const FALLBACK_FILE_NAME = 'github-token.secure.json'

type KeytarModule = {
  getPassword: (service: string, account: string) => Promise<string | null>
  setPassword: (service: string, account: string, password: string) => Promise<void>
  deletePassword: (service: string, account: string) => Promise<boolean>
}

interface FallbackTokenPayload {
  encrypted: boolean
  token: string
}

let keytarPromise: Promise<KeytarModule | null> | null = null
let hasLoggedKeytarLoadFailure = false

const logSecureStoreFailure = (event: string, error: unknown): void => {
  appendAppLog({
    level: 'error',
    source: 'main',
    event,
    message: error instanceof Error ? error.message : 'Secure store operation failed.'
  })
}

const getFallbackFilePath = (): string => {
  return join(app.getPath('userData'), FALLBACK_FILE_NAME)
}

const parseFallbackPayload = (raw: string): FallbackTokenPayload | null => {
  try {
    const parsed = JSON.parse(raw) as Partial<FallbackTokenPayload>

    if (typeof parsed.token !== 'string' || typeof parsed.encrypted !== 'boolean') {
      return null
    }

    return {
      encrypted: parsed.encrypted,
      token: parsed.token
    }
  } catch {
    return null
  }
}

const loadKeytar = async (): Promise<KeytarModule | null> => {
  if (!keytarPromise) {
    keytarPromise = import('keytar')
      .then((module) => {
        const candidate = (module.default ?? module) as Partial<KeytarModule>

        if (
          typeof candidate.getPassword !== 'function' ||
          typeof candidate.setPassword !== 'function' ||
          typeof candidate.deletePassword !== 'function'
        ) {
          return null
        }

        return candidate as KeytarModule
      })
      .catch((error: unknown) => {
        if (!hasLoggedKeytarLoadFailure) {
          hasLoggedKeytarLoadFailure = true
          logSecureStoreFailure('secure-store-keytar-load-failed', error)
        }

        return null
      })
  }

  return keytarPromise
}

const readFallbackToken = async (): Promise<string> => {
  try {
    const raw = await readFile(getFallbackFilePath(), 'utf8')
    const payload = parseFallbackPayload(raw)

    if (!payload || !payload.token) {
      return ''
    }

    if (!payload.encrypted) {
      return payload.token
    }

    if (!safeStorage.isEncryptionAvailable()) {
      return ''
    }

    return safeStorage.decryptString(Buffer.from(payload.token, 'base64'))
  } catch (error) {
    const err = error as NodeJS.ErrnoException

    if (err.code === 'ENOENT') {
      return ''
    }

    logSecureStoreFailure('secure-store-fallback-read-failed', error)
    return ''
  }
}

const writeFallbackToken = async (token: string): Promise<boolean> => {
  try {
    const filePath = getFallbackFilePath()
    await mkdir(dirname(filePath), { recursive: true })

    const payload: FallbackTokenPayload = safeStorage.isEncryptionAvailable()
      ? {
          encrypted: true,
          token: safeStorage.encryptString(token).toString('base64')
        }
      : {
          encrypted: false,
          token
        }

    await writeFile(filePath, JSON.stringify(payload), 'utf8')
    return true
  } catch (error) {
    logSecureStoreFailure('secure-store-fallback-write-failed', error)
    return false
  }
}

const clearFallbackToken = async (): Promise<boolean> => {
  try {
    await rm(getFallbackFilePath(), { force: true })
    return true
  } catch (error) {
    logSecureStoreFailure('secure-store-fallback-clear-failed', error)
    return false
  }
}

export const getGitHubToken = async (): Promise<string> => {
  const keytar = await loadKeytar()

  if (keytar) {
    try {
      const token = (await keytar.getPassword(SERVICE_NAME, GITHUB_TOKEN_ACCOUNT)) ?? ''

      if (token) {
        return token
      }
    } catch (error) {
      logSecureStoreFailure('secure-store-read-failed', error)
    }
  }

  try {
    const fallbackToken = await readFallbackToken()

    if (fallbackToken && keytar) {
      try {
        await keytar.setPassword(SERVICE_NAME, GITHUB_TOKEN_ACCOUNT, fallbackToken)
        await clearFallbackToken()
      } catch (error) {
        logSecureStoreFailure('secure-store-fallback-migrate-failed', error)
      }
    }

    return fallbackToken
  } catch {
    return ''
  }
}

export const setGitHubToken = async (token: string): Promise<boolean> => {
  const trimmed = token.trim()

  if (!trimmed) {
    return clearGitHubToken()
  }

  const keytar = await loadKeytar()

  if (keytar) {
    try {
      await keytar.setPassword(SERVICE_NAME, GITHUB_TOKEN_ACCOUNT, trimmed)
      await clearFallbackToken()
      return true
    } catch (error) {
      logSecureStoreFailure('secure-store-write-failed', error)
    }
  }

  return writeFallbackToken(trimmed)
}

export const clearGitHubToken = async (): Promise<boolean> => {
  let keytarCleared = true
  const keytar = await loadKeytar()

  if (keytar) {
    try {
      await keytar.deletePassword(SERVICE_NAME, GITHUB_TOKEN_ACCOUNT)
    } catch (error) {
      logSecureStoreFailure('secure-store-clear-failed', error)
      keytarCleared = false
    }
  }

  const fallbackCleared = await clearFallbackToken()
  return keytarCleared && fallbackCleared
}
