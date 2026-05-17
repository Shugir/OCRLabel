const { BrowserWindow } = require('electron')

function printLabel(html, printerName, copies = 1) {
  return new Promise((resolve, reject) => {
    const win = new BrowserWindow({
      show: false,
      webPreferences: { nodeIntegration: false, contextIsolation: true },
    })

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: 62mm auto; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 62mm; font-family: Arial, sans-serif; font-size: 6pt; }
  </style>
</head>
<body>${html}</body>
</html>`

    win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(fullHtml))

    const timeout = setTimeout(() => {
      win.destroy()
      reject(new Error('Print window timed out'))
    }, 15000)

    win.webContents.once('did-finish-load', async () => {
      clearTimeout(timeout)
      try {
        const explicitPrinter = printerName && printerName.trim()
        const printOptions = { silent: true, margins: { marginType: 'none' }, copies: Math.max(1, Math.floor(copies)) }

        if (explicitPrinter) {
          printOptions.deviceName = explicitPrinter
          console.log('[print] using explicit printer:', explicitPrinter)
        } else {
          const printers = await win.webContents.getPrintersAsync()
          if (printers.length === 0) {
            win.destroy()
            return reject(new Error('No printers found. Install a printer in Windows first.'))
          }
          const def = printers.find((p) => p.isDefault) || printers[0]
          console.log('[print] available printers:', printers.map((p) => `${p.name}${p.isDefault ? ' [default]' : ''}`).join(', '))
          console.log('[print] using default printer without deviceName override')
        }

        win.webContents.print(
          printOptions,
          (success, errorType) => {
            win.destroy()
            if (success) resolve()
            else reject(new Error(`Print failed: ${errorType}`))
          }
        )
      } catch (e) {
        win.destroy()
        reject(e)
      }
    })

    win.webContents.once('did-fail-load', (_e, code, desc) => {
      clearTimeout(timeout)
      win.destroy()
      reject(new Error(`Print window failed to load: ${desc}`))
    })
  })
}

module.exports = { printLabel }
