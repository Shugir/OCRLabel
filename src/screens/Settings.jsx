import { useState, useEffect } from 'react'

export default function Settings() {
  const [apiKey, setApiKey] = useState('')
  const [printerName, setPrinterName] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    window.api.config.get().then((cfg) => {
      setApiKey(cfg.anthropicApiKey || '')
      setPrinterName(cfg.printerName || '')
    })
  }, [])

  async function handleSave() {
    await window.api.config.set('anthropicApiKey', apiKey)
    await window.api.config.set('printerName', printerName)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>Instellingen</h2>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="apikey" style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
          Anthropic API-sleutel
        </label>
        <input
          id="apikey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-ant-..."
          style={{ width: '100%', fontSize: 14, padding: '6px 8px' }}
        />
        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
          Verkrijgbaar via console.anthropic.com
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label htmlFor="printer" style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
          Printernaam
        </label>
        <input
          id="printer"
          type="text"
          value={printerName}
          onChange={(e) => setPrinterName(e.target.value)}
          placeholder="Brother QL-810W"
          style={{ width: '100%', fontSize: 14, padding: '6px 8px' }}
        />
        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
          Moet exact overeenkomen met de naam in Windows Printers
        </div>
      </div>

      <button onClick={handleSave} style={{ padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>
        Opslaan
      </button>
      {saved && <span style={{ marginLeft: 12, color: 'green' }}>Opgeslagen!</span>}
    </div>
  )
}
