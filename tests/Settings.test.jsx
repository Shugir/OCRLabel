// tests/Settings.test.jsx
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Settings from '../src/screens/Settings.jsx'

beforeEach(() => {
  window.api = {
    config: {
      get: vi.fn().mockResolvedValue({
        anthropicApiKey: 'sk-existing',
        anthropicBaseUrl: '',
        aiBackend: 'claude',
        ollamaHost: 'http://localhost:11434',
        ollamaModel: 'llama3.2-vision',
        printerName: 'TestPrinter',
        language: 'en',
      }),
      set: vi.fn().mockResolvedValue(undefined),
    },
  }
})

describe('Settings', () => {
  it('loads printer name from config', async () => {
    render(<Settings />)
    await waitFor(() => {
      expect(screen.getByDisplayValue('TestPrinter')).toBeInTheDocument()
    })
  })

  it('shows Claude API key field when aiBackend is claude', async () => {
    render(<Settings />)
    await waitFor(() => {
      expect(screen.getByLabelText(/api key/i)).toBeInTheDocument()
    })
  })

  it('shows Ollama host field when aiBackend is ollama', async () => {
    window.api.config.get.mockResolvedValue({
      anthropicApiKey: '',
      anthropicBaseUrl: '',
      aiBackend: 'ollama',
      ollamaHost: 'http://localhost:11434',
      ollamaModel: 'llama3.2-vision',
      printerName: '',
      language: 'en',
    })
    render(<Settings />)
    await waitFor(() => {
      expect(screen.getByDisplayValue('http://localhost:11434')).toBeInTheDocument()
    })
  })

  it('saves all config fields on save click', async () => {
    render(<Settings />)
    await waitFor(() => screen.getByDisplayValue('TestPrinter'))
    fireEvent.change(screen.getByLabelText(/printer name/i), { target: { value: 'Brother QL-810W' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(window.api.config.set).toHaveBeenCalledTimes(6)
      expect(window.api.config.set).toHaveBeenCalledWith('aiBackend', 'claude')
      expect(window.api.config.set).toHaveBeenCalledWith('anthropicApiKey', 'sk-existing')
      expect(window.api.config.set).toHaveBeenCalledWith('anthropicBaseUrl', '')
      expect(window.api.config.set).toHaveBeenCalledWith('printerName', 'Brother QL-810W')
      expect(window.api.config.set).toHaveBeenCalledWith('ollamaHost', 'http://localhost:11434')
      expect(window.api.config.set).toHaveBeenCalledWith('ollamaModel', 'llama3.2-vision')
    })
  })
})
