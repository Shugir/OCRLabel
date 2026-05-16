// src/screens/Settings.jsx
import { useState, useEffect } from 'react'
import { useT } from '../i18n.js'

function Field({ label, id, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
        {label}
      </label>
      {children}
      {hint && <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

function BackendToggle({ value, onChange }) {
  const options = [{ v: 'claude', label: 'Claude' }, { v: 'ollama', label: 'Ollama' }]
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
      {options.map(({ v, label }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          style={{
            padding: '4px 16px',
            cursor: 'pointer',
            fontWeight: value === v ? 'bold' : 'normal',
            background: value === v ? '#333' : '#fff',
            color: value === v ? '#fff' : '#333',
            border: '1px solid #ccc',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default function Settings() {
  const { t } = useT()
  const [aiBackend, setAiBackend] = useState('claude')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [ollamaHost, setOllamaHost] = useState('http://localhost:11434')
  const [ollamaModel, setOllamaModel] = useState('llama3.2-vision')
  const [printerName, setPrinterName] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    window.api.config.get().then((cfg) => {
      setAiBackend(cfg.aiBackend || 'claude')
      setApiKey(cfg.anthropicApiKey || '')
      setBaseUrl(cfg.anthropicBaseUrl || '')
      setOllamaHost(cfg.ollamaHost || 'http://localhost:11434')
      setOllamaModel(cfg.ollamaModel || 'llama3.2-vision')
      setPrinterName(cfg.printerName || '')
    })
  }, [])

  async function handleSave() {
    await window.api.config.set('aiBackend', aiBackend)
    await window.api.config.set('anthropicApiKey', apiKey)
    await window.api.config.set('anthropicBaseUrl', baseUrl)
    await window.api.config.set('ollamaHost', ollamaHost)
    await window.api.config.set('ollamaModel', ollamaModel)
    await window.api.config.set('printerName', printerName)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputStyle = { width: '100%', fontSize: 14, padding: '6px 8px' }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>{t('settings_title')}</h2>

      <div style={{ marginBottom: 8, fontWeight: 'bold' }}>{t('settings_ai_backend')}</div>
      <BackendToggle value={aiBackend} onChange={setAiBackend} />

      {aiBackend === 'claude' && (
        <>
          <Field label={t('settings_claude_key')} id="apikey" hint={t('settings_claude_key_hint')}>
            <input
              id="apikey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              style={inputStyle}
            />
          </Field>
          <Field label={t('settings_claude_base_url')} id="baseUrl" hint={t('settings_claude_base_url_hint')}>
            <input
              id="baseUrl"
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              style={inputStyle}
            />
          </Field>
        </>
      )}

      {aiBackend === 'ollama' && (
        <>
          <Field label={t('settings_ollama_host')} id="ollamaHost">
            <input
              id="ollamaHost"
              type="text"
              value={ollamaHost}
              onChange={(e) => setOllamaHost(e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label={t('settings_ollama_model')} id="ollamaModel">
            <input
              id="ollamaModel"
              type="text"
              value={ollamaModel}
              onChange={(e) => setOllamaModel(e.target.value)}
              style={inputStyle}
            />
          </Field>
        </>
      )}

      <Field label={t('settings_printer')} id="printer" hint={t('settings_printer_hint')}>
        <input
          id="printer"
          type="text"
          value={printerName}
          onChange={(e) => setPrinterName(e.target.value)}
          placeholder="Brother QL-810W"
          style={inputStyle}
        />
      </Field>

      <button onClick={handleSave} style={{ padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>
        {t('settings_save_btn')}
      </button>
      {saved && <span style={{ marginLeft: 12, color: 'green' }}>{t('settings_saved')}</span>}
    </div>
  )
}
