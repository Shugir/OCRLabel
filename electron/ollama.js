// electron/ollama.js
const { parseExtractedJson, buildPrompt } = require('./claude')

async function ollamaExtract(imagePath, config) {
  const { ollamaHost = 'http://localhost:11434', ollamaModel = 'llama3.2-vision' } = config

  const { readFileSync } = await import('fs')
  const imageData = readFileSync(imagePath)
  const base64 = imageData.toString('base64')

  const body = JSON.stringify({
    model: ollamaModel,
    messages: [
      {
        role: 'user',
        content: buildPrompt(),
        images: [base64],
      },
    ],
    stream: false,
  })

  const url = new URL('/api/chat', ollamaHost)
  const transport = url.protocol === 'https:' ? await import('https') : await import('http')

  return new Promise((resolve, reject) => {
    const req = transport.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            if (json.error) {
              reject(new Error(json.error))
            } else {
              const content = json.message?.content || ''
              require('fs').writeFileSync(
                require('path').join(require('os').homedir(), '.ocrlabel', 'ollama-debug.txt'),
                content,
                'utf8'
              )
              resolve(parseExtractedJson(content))
            }
          } catch {
            reject(new Error('Invalid response from Ollama'))
          }
        })
      }
    )

    req.on('error', (e) => {
      if (e.code === 'ECONNREFUSED') {
        reject(new Error(`Ollama not reachable at ${ollamaHost}`))
      } else {
        reject(e)
      }
    })

    req.write(body)
    req.end()
  })
}

module.exports = { ollamaExtract }
