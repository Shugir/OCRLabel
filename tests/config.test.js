import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import os from 'os'

process.env.OCRLABEL_CONFIG_DIR = join(os.tmpdir(), 'ocrlabel-test-' + Date.now())

const { getConfig, setConfig } = await import('../electron/config.js')

describe('config', () => {
  afterEach(() => {
    rmSync(process.env.OCRLABEL_CONFIG_DIR, { recursive: true, force: true })
  })

  it('returns empty object when no config file exists', () => {
    expect(getConfig()).toEqual({})
  })

  it('saves and retrieves a value', () => {
    setConfig('anthropicApiKey', 'sk-test-123')
    expect(getConfig().anthropicApiKey).toBe('sk-test-123')
  })

  it('merges new values with existing', () => {
    setConfig('anthropicApiKey', 'sk-test-123')
    setConfig('printerName', 'Brother QL-810W')
    const cfg = getConfig()
    expect(cfg.anthropicApiKey).toBe('sk-test-123')
    expect(cfg.printerName).toBe('Brother QL-810W')
  })
})
