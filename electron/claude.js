const Anthropic = require('@anthropic-ai/sdk')
const { readFileSync } = require('fs')

function buildPrompt() {
  return `You are a food label data extractor. Examine this product packaging image carefully.
Extract all product information visible on the packaging and return ONLY valid JSON — no other text — with exactly these fields:
{
  "product_name": "product name in Dutch",
  "ingredients": "Ingrediënten: full ingredients list translated to Dutch",
  "allergens": "Kan bevatten: allergen statement in Dutch",
  "storage_info": "Bewaren ... storage instructions in Dutch",
  "manufacturer": "Fabrikant/Importeur: name and address",
  "net_weight": "e.g. 100g",
  "energy_kj": "numeric value only e.g. 2187",
  "energy_kcal": "numeric value only e.g. 521",
  "fat_total": "numeric value only e.g. 36",
  "fat_saturated": "numeric value only e.g. 16",
  "carbs_total": "numeric value only e.g. 58",
  "carbs_sugars": "numeric value only e.g. 33",
  "fiber": "numeric value only e.g. 0.5",
  "protein": "numeric value only e.g. 6.6",
  "salt": "numeric value only e.g. 0.36"
}
Use standard Dutch food label terminology (Ingrediënten, Kan bevatten, Bewaren, Gemiddelde voedingswaarden).
Translate all text to Dutch. If a value cannot be determined, use an empty string.`
}

function parseExtractedJson(text) {
  try {
    return JSON.parse(text.trim())
  } catch {}

  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlock) {
    try {
      return JSON.parse(codeBlock[1].trim())
    } catch {}
  }

  const braceMatch = text.match(/\{[\s\S]*\}/)
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0])
    } catch {}
  }

  return null
}

async function claudeExtract(imagePath, config) {
  const { anthropicApiKey: apiKey, anthropicBaseUrl: baseUrl } = config
  const client = new Anthropic({
    apiKey,
    ...(baseUrl ? { baseURL: baseUrl } : {}),
  })
  const imageData = readFileSync(imagePath)
  const base64 = imageData.toString('base64')
  const ext = imagePath.split('.').pop().toLowerCase()
  const mediaType = ext === 'png' ? 'image/png' : 'image/jpeg'

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: buildPrompt() },
        ],
      },
    ],
  })

  const text = response.content[0].text
  return parseExtractedJson(text)
}

module.exports = { claudeExtract, parseExtractedJson, buildPrompt }
