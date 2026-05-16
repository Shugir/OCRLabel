// electron/ollama.js
const { parseExtractedJson } = require('./claude')

function buildOllamaPrompt() {
  return `You are a food label extractor. This packaging may have text in multiple languages (Russian, Polish, Kazakh, etc.).

Step 1 – Read all visible text from the image in any language.
Step 2 – Translate all product information into Dutch.
Step 3 – Look for a nutrition facts table anywhere on the packaging (any language). Extract the numbers.
Step 4 – Return ONLY the following JSON object, nothing else:

{
  "product_name": "product name translated to Dutch",
  "ingredients": "Ingrediënten: full list translated to Dutch",
  "allergens": "Kan bevatten: allergen statement translated to Dutch",
  "storage_info": "Bewaren: storage instructions translated to Dutch",
  "manufacturer": "manufacturer/importer name and address",
  "net_weight": "e.g. 100g",
  "energy_kj": "number only from Energie/Энергия row e.g. 2187",
  "energy_kcal": "number only from Energie/Энергия row e.g. 524",
  "fat_total": "number only from Vetten/Жиры row",
  "fat_saturated": "number only from verzadigde/насыщенные row",
  "carbs_total": "number only from Koolhydraten/Углеводы row",
  "carbs_sugars": "number only from suikers/сахара row",
  "fiber": "number only from Vezels/Пищевые волокна row",
  "protein": "number only from Eiwitten/Белки row",
  "salt": "number only from Zout/Соль row"
}

If a nutrition value is not visible, use "". Start response with { and end with }.`
}

async function ollamaExtract(imagePath, config) {
  const { ollamaHost = 'http://localhost:11434', ollamaModel = 'llama3.2-vision' } = config

  const { readFileSync } = await import('fs')
  const base64 = readFileSync(imagePath).toString('base64')

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
        timeout: 300000,
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

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Ollama timed out after 5 minutes. Try a smaller/faster model.'))
    })

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
