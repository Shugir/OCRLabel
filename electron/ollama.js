// electron/ollama.js
const { parseExtractedJson } = require('./claude')

function buildOllamaPrompt() {
  return `You are reading a food product packaging image. The packaging may have text in multiple languages.

Focus on finding:
1. The DUTCH text sections (Nederlands/NL) — look for words like "Ingrediënten", "Kan bevatten", "Bewaren", "Netto gewicht"
2. The nutrition facts table — look for "Gemiddelde voedingswaarden" or "Voedingswaarden per 100 g" with rows like Energie, Vetten, Koolhydraten, Vezels, Eiwitten, Zout
3. If no Dutch text is visible, transcribe ALL text you can see including any nutrition table in any language

Transcribe all found text exactly as written. Do not summarize. Include every number from the nutrition table.`
}

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
        content: buildOllamaPrompt(),
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
