const { readFileSync, writeFileSync, mkdirSync, existsSync } = require('fs')
const { join } = require('path')
const os = require('os')

function configDir() {
  return process.env.OCRLABEL_CONFIG_DIR || join(os.homedir(), '.ocrlabel')
}

function configPath() {
  return join(configDir(), 'config.json')
}

function getConfig() {
  const p = configPath()
  if (!existsSync(p)) return {}
  try {
    return JSON.parse(readFileSync(p, 'utf8'))
  } catch {
    return {}
  }
}

function setConfig(key, value) {
  const dir = configDir()
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const cfg = getConfig()
  cfg[key] = value
  writeFileSync(configPath(), JSON.stringify(cfg, null, 2), 'utf8')
}

module.exports = { getConfig, setConfig }
