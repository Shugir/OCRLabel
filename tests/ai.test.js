// tests/ai.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../electron/claude.js', () => ({
  claudeExtract: vi.fn(),
  parseExtractedJson: vi.fn(),
  buildPrompt: vi.fn(),
}))

vi.mock('../electron/ollama.js', () => ({
  ollamaExtract: vi.fn(),
}))

const { extractFromImage } = await import('../electron/ai.js')
const { claudeExtract } = await import('../electron/claude.js')
const { ollamaExtract } = await import('../electron/ollama.js')

beforeEach(() => {
  claudeExtract.mockReset()
  ollamaExtract.mockReset()
})

describe('extractFromImage routing', () => {
  it('routes to claudeExtract by default', async () => {
    claudeExtract.mockResolvedValue({ product_name: 'Claude result' })
    const cfg = { aiBackend: 'claude', anthropicApiKey: 'key' }
    const result = await extractFromImage('/img.jpg', cfg)
    expect(claudeExtract).toHaveBeenCalledWith('/img.jpg', cfg)
    expect(ollamaExtract).not.toHaveBeenCalled()
    expect(result).toEqual({ product_name: 'Claude result' })
  })

  it('routes to claudeExtract when aiBackend is absent', async () => {
    claudeExtract.mockResolvedValue({ product_name: 'Claude result' })
    const cfg = { anthropicApiKey: 'key' }
    await extractFromImage('/img.jpg', cfg)
    expect(claudeExtract).toHaveBeenCalledWith('/img.jpg', cfg)
  })

  it('routes to ollamaExtract when aiBackend is ollama', async () => {
    ollamaExtract.mockResolvedValue({ product_name: 'Ollama result' })
    const cfg = { aiBackend: 'ollama', ollamaHost: 'http://localhost:11434' }
    const result = await extractFromImage('/img.jpg', cfg)
    expect(ollamaExtract).toHaveBeenCalledWith('/img.jpg', cfg)
    expect(claudeExtract).not.toHaveBeenCalled()
    expect(result).toEqual({ product_name: 'Ollama result' })
  })
})
