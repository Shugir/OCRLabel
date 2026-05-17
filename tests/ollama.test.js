// tests/ollama.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventEmitter } from 'events'

vi.mock('fs', () => ({
  readFileSync: vi.fn(() => Buffer.from('fakeimagebytes')),
}))

vi.mock('../electron/claude.js', () => ({
  parseExtractedJson: vi.fn((text) => {
    try { return JSON.parse(text) } catch { return null }
  }),
  buildPrompt: vi.fn(() => 'test prompt'),
}))

const mockHttpRequest = vi.fn()
vi.mock('http', () => ({ request: mockHttpRequest }))
vi.mock('https', () => ({ request: mockHttpRequest }))

const { ollamaExtract } = await import('../electron/ollama.js')

function makeReq(onEnd) {
  const req = new EventEmitter()
  req.write = vi.fn()
  req.end = vi.fn(() => onEnd(req))
  return req
}

function makeRes(body) {
  const res = new EventEmitter()
  setTimeout(() => {
    res.emit('data', body)
    res.emit('end')
  }, 0)
  return res
}

beforeEach(() => {
  mockHttpRequest.mockReset()
})

describe('ollamaExtract', () => {
  it('throws readable error on ECONNREFUSED', async () => {
    mockHttpRequest.mockImplementation(() =>
      makeReq((req) => {
        const err = Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' })
        setTimeout(() => req.emit('error', err), 0)
      })
    )

    await expect(
      ollamaExtract('/fake/image.jpg', {
        ollamaHost: 'http://localhost:11434',
        ollamaModel: 'llama3.2-vision',
      })
    ).rejects.toThrow('Ollama not reachable at http://localhost:11434')
  })

  it('returns parsed data on success', async () => {
    const payload = JSON.stringify({
      response: JSON.stringify({
        ingredients: 'Ingrediënten: tarwebloem',
        energy_kj: '2187',
        energy_kcal: '524',
        fat_total: '30',
        net_weight: '100g',
      }),
      done: true,
    })
    mockHttpRequest.mockImplementation((_opts, callback) => {
      const res = makeRes(payload)
      return makeReq(() => callback(res))
    })

    const result = await ollamaExtract('/fake/image.jpg', {
      ollamaHost: 'http://localhost:11434',
      ollamaModel: 'gemma4:31b-cloud',
    })
    expect(result.ingredients).toBe('Ingrediënten: tarwebloem')
    expect(result.energy_kj).toBe('2187')
    expect(result.product_name).toBe('')
  })

  it('throws on Ollama error response', async () => {
    mockHttpRequest.mockImplementation((_opts, callback) => {
      const res = makeRes(JSON.stringify({ error: 'model not found' }))
      return makeReq(() => callback(res))
    })

    await expect(
      ollamaExtract('/fake/image.jpg', {
        ollamaHost: 'http://localhost:11434',
        ollamaModel: 'bad-model',
      })
    ).rejects.toThrow('model not found')
  })
})
