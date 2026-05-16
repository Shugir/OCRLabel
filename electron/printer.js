const { BrowserWindow } = require('electron')

function printLabel(html, printerName) {
  return new Promise((resolve, reject) => {
    const win = new BrowserWindow({
      show: false,
      webPreferences: { nodeIntegration: false, contextIsolation: true },
    })

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { width: 62mm; font-family: Arial, sans-serif; font-size: 6pt; }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `

    win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(fullHtml))

    win.webContents.once('did-finish-load', () => {
      win.webContents.print(
        {
          silent: true,
          deviceName: printerName || '',
          pageSize: { width: 62000, height: 0 },
          margins: { marginType: 'none' },
          scaleFactor: 100,
        },
        (success, errorType) => {
          win.close()
          if (success) resolve()
          else reject(new Error(`Print failed: ${errorType}`))
        }
      )
    })
  })
}

module.exports = { printLabel }
