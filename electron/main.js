const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const { getConfig, setConfig } = require('./config')
const { initDb, saveLabel, listLabels, getLabel, deleteLabel, markPrinted } = require('./db')
const { extractFromImage } = require('./claude')
const { printLabel } = require('./printer')

const isDev = process.env.NODE_ENV !== 'production'

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  initDb()
  createWindow()
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })

// Config
ipcMain.handle('config:get', () => getConfig())
ipcMain.handle('config:set', (_e, key, value) => { setConfig(key, value) })

// File picker
ipcMain.handle('file:open', async () => {
  const result = await dialog.showOpenDialog({
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }],
    properties: ['openFile'],
  })
  return result.canceled ? null : result.filePaths[0]
})

// OCR
ipcMain.handle('ocr:extract', async (_e, imagePath) => {
  const cfg = getConfig()
  if (!cfg.anthropicApiKey) throw new Error('API sleutel niet ingesteld. Ga naar Instellingen.')
  return extractFromImage(imagePath, cfg.anthropicApiKey)
})

// Labels CRUD
ipcMain.handle('label:save', (_e, data) => saveLabel(data))
ipcMain.handle('label:list', () => listLabels())
ipcMain.handle('label:get', (_e, id) => getLabel(id))
ipcMain.handle('label:delete', (_e, id) => deleteLabel(id))

// Print
ipcMain.handle('print:label', async (_e, html) => {
  const cfg = getConfig()
  await printLabel(html, cfg.printerName || '')
  return true
})

// Mark printed (called after successful print)
ipcMain.handle('label:markPrinted', (_e, id) => markPrinted(id))
