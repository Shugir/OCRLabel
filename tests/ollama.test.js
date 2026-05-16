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
    mockHttpRequest.mockImplementation((_opts, callback) => {
      const res = makeRes(JSON.stringify({ message: { content: '{"product_name":"Test"}' } }))
      return makeReq(() => callback(res))
    })

    const result = await ollamaExtract('/fake/image.jpg', {
      ollamaHost: 'http://localhost:11434',
      ollamaModel: 'llama3.2-vision',
    })
    expect(result).toEqual({ product_name: 'Test' })
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
