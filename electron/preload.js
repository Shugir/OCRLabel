const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  config: {
    get: () => ipcRenderer.invoke('config:get'),
    set: (key, value) => ipcRenderer.invoke('config:set', key, value),
  },
  file: {
    open: () => ipcRenderer.invoke('file:open'),
  },
  ocr: {
    extract: (imagePath) => ipcRenderer.invoke('ocr:extract', imagePath),
  },
  label: {
    save: (data) => ipcRenderer.invoke('label:save', data),
    list: () => ipcRenderer.invoke('label:list'),
    get: (id) => ipcRenderer.invoke('label:get', id),
    delete: (id) => ipcRenderer.invoke('label:delete', id),
    markPrinted: (id) => ipcRenderer.invoke('label:markPrinted', id),
  },
  print: {
    label: (html) => ipcRenderer.invoke('print:label', html),
  },
})
