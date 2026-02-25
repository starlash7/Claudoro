import keytar from 'keytar'
import { appendAppLog } from './logger'

const SERVICE_NAME = 'com.claudoro.app'
const GITHUB_TOKEN_ACCOUNT = 'github-token'

const logSecureStoreFailure = (event: string, error: unknown): void => {
  appendAppLog({
    level: 'error',
    source: 'main',
    event,
    message: error instanceof Error ? error.message : 'Secure store operation failed.'
  })
}

export const getGitHubToken = async (): Promise<string> => {
  try {
    return (await keytar.getPassword(SERVICE_NAME, GITHUB_TOKEN_ACCOUNT)) ?? ''
  } catch (error) {
    logSecureStoreFailure('secure-store-read-failed', error)
    return ''
  }
}

export const setGitHubToken = async (token: string): Promise<boolean> => {
  const trimmed = token.trim()

  if (!trimmed) {
    return clearGitHubToken()
  }

  try {
    await keytar.setPassword(SERVICE_NAME, GITHUB_TOKEN_ACCOUNT, trimmed)
    return true
  } catch (error) {
    logSecureStoreFailure('secure-store-write-failed', error)
    return false
  }
}

export const clearGitHubToken = async (): Promise<boolean> => {
  try {
    await keytar.deletePassword(SERVICE_NAME, GITHUB_TOKEN_ACCOUNT)
    return true
  } catch (error) {
    logSecureStoreFailure('secure-store-clear-failed', error)
    return false
  }
}
