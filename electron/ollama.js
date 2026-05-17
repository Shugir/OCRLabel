// electron/ollama.js
const { parseExtractedJson } = require('./claude')

function buildOllamaPrompt() {
  return `You are a food label data extractor. Extract data from this packaging image.
The packaging may have text in Russian, Polish, Kazakh, or other languages — translate everything to Dutch.

Return ONLY this JSON object (no markdown, no explanation):
{
  "ingredients": "Full Dutch label text as one block: product name on first line, then ingredients, allergens, storage, manufacturer",
  "net_weight": "e.g. 100g",
  "energy_kj": "number only e.g. 2187",
  "energy_kcal": "number only e.g. 524",
  "fat_total": "number only e.g. 30",
  "fat_saturated": "number only e.g. 16",
  "carbs_total": "number only e.g. 58",
  "carbs_sugars": "number only e.g. 33",
  "fiber": "number only e.g. 0.5",
  "protein": "number only e.g. 6.6",
  "salt": "number only e.g. 0.36"
}

Example output for a milk wafer product:
{
  "ingredients": "(NL) WAFELS MELK\\n\\nIngrediënten: tarwebloem, plantaardige vetten (palmolie), suiker, volle melkpoeder 7%, magere melkpoeder 6%, emulgator: lecithinen (SOJA), rijsmiddelen, zout, aroma's.\\n\\nKan bevatten: EI, PINDA'S, NOTEN, SESAM.\\n\\nBewaren: op een droge plaats bij een temperatuur van 18°C en maximaal 75% luchtvochtigheid.\\n\\nFabrikant: \\"Konditer-Aziya\\" LLP, Almaty, Kazachstan. Importeur: ROSHEN EUROPE Sp. z o.o., Warschau, Polen.",
  "net_weight": "100g",
  "energy_kj": "2187",
  "energy_kcal": "524",
  "fat_total": "30",
  "fat_saturated": "16",
  "carbs_total": "58",
  "carbs_sugars": "33",
  "fiber": "0.5",
  "protein": "6.6",
  "salt": "0.36"
}`
}

async function ollamaExtract(imagePath, config) {
  const { ollamaHost = 'http://localhost:11434', ollamaModel = 'llama3.2-vision' } = config

  const { readFileSync } = await import('fs')
  const base64 = readFileSync(imagePath).toString('base64')

  const body = JSON.stringify({
    model: ollamaModel,
    prompt: buildOllamaPrompt(),
    images: [base64],
    stream: false,
    format: 'json',
  })

  const url = new URL('/api/generate', ollamaHost)
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
              const content = json.response || ''
              require('fs').writeFileSync(
                require('path').join(require('os').homedir(), '.ocrlabel', 'ollama-debug.txt'),
                content,
                'utf8'
              )
              if (!content.trim()) return resolve(null)
              const parsed = parseExtractedJson(content)
              if (!parsed) return resolve(null)
              resolve({
                product_name: '',
                allergens: '',
                storage_info: '',
                manufacturer: '',
                ingredients: parsed.ingredients || '',
                net_weight:    parsed.net_weight    || '',
                energy_kj:     parsed.energy_kj     || '',
                energy_kcal:   parsed.energy_kcal   || '',
                fat_total:     parsed.fat_total      || '',
                fat_saturated: parsed.fat_saturated  || '',
                carbs_total:   parsed.carbs_total    || '',
                carbs_sugars:  parsed.carbs_sugars   || '',
                fiber:         parsed.fiber          || '',
                protein:       parsed.protein        || '',
                salt:          parsed.salt           || '',
              })
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
