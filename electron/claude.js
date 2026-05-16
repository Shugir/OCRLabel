const Anthropic = require('@anthropic-ai/sdk')
const { readFileSync } = require('fs')

function buildPrompt() {
  return `You are a food label data extractor. Examine this product packaging image carefully.

Look for a nutrition facts table (often titled "Gemiddelde voedingswaarden" or "Voedingswaarden per 100g").
Extract the numbers from that table:
- "Energie" row → energy_kj (kJ number) and energy_kcal (kcal number). Example: "2187 kJ / 524 kcal" → energy_kj="2187", energy_kcal="524"
- "Vetten" or "Vet" row (total) → fat_total. Example: "30 g" → fat_total="30"
- "waarvan verzadigde vetzuren" row → fat_saturated
- "Koolhydraten" row (total) → carbs_total
- "waarvan suikers" row → carbs_sugars
- "Vezels" row → fiber
- "Eiwitten" row → protein
- "Zout" row → salt
- Net weight (e.g. "100g", "200g") anywhere on pack → net_weight

Return ONLY this JSON object, no markdown, no explanation:
{
  "product_name": "product name in Dutch",
  "ingredients": "Ingrediënten: full list in Dutch",
  "allergens": "Kan bevatten: allergen statement in Dutch",
  "storage_info": "Bewaren: storage instructions in Dutch",
  "manufacturer": "Fabrikant/Importeur: name and address",
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
If a value is not visible, use "". Start response with { and end with }.`
}

function parseFromText(text) {
  const num = (pattern) => {
    const m = text.match(pattern)
    return m ? m[1].replace(',', '.') : ''
  }

  const energyM = text.match(/Energie[^\d]*(\d+(?:[,.]\d+)?)\s*kJ[^\/\d]*(\d+(?:[,.]\d+)?)\s*kcal/i)
  const energy_kj = energyM ? energyM[1] : ''
  const energy_kcal = energyM ? energyM[2] : ''

  const fat_total = num(/Vetten\s+(\d+(?:[,.]\d+)?)/i)
  const fat_saturated = num(/verzadigde\s+vetzuren\s+(\d+(?:[,.]\d+)?)/i)
  const carbs_total = num(/Koolhydraten\s+(\d+(?:[,.]\d+)?)/i)
  const carbs_sugars = num(/(?:waarvan\s+)?suikers\s+(\d+(?:[,.]\d+)?)/i)
  const fiber = num(/Vezels\s+(\d+(?:[,.]\d+)?)/i)
  const protein = num(/Eiwitten\s+(\d+(?:[,.]\d+)?)/i)
  const salt = num(/Zout\s+(\d+(?:[,.]\d+)?)/i)

  const ingM = text.match(/Ingredi[eë]nten[:\s]+([\s\S]*?)(?:\n\n|Kan bevatten|Bewaren|$)/i)
  const ingredients = ingM ? 'Ingrediënten: ' + ingM[1].replace(/\n/g, ' ').trim() : ''

  const algM = text.match(/Kan bevatten[:\s]+([^\n.]+)/i)
  const allergens = algM ? 'Kan bevatten: ' + algM[1].trim() : ''

  const storM = text.match(/Bewaren[:\s]+([^\n.]+)/i)
  const storage_info = storM ? 'Bewaren ' + storM[1].trim() : ''

  const mfgM = text.match(/(?:Fabrikant|Importeur|Produced by|Manufactured)[:\s]+([^\n]+)/i)
  const manufacturer = mfgM ? mfgM[1].trim() : ''

  const wtM = text.match(/Netto[:\s]+([^\n]+)/i) || text.match(/(\d+\s*g)\b/)
  const net_weight = wtM ? wtM[1].trim() : ''

  const nameM = text.match(/^([^\n]+)/i)
  const product_name = nameM ? nameM[1].trim() : ''

  if (!energy_kj && !fat_total && !protein) return null

  return {
    product_name, ingredients, allergens, storage_info, manufacturer, net_weight,
    energy_kj, energy_kcal, fat_total, fat_saturated,
    carbs_total, carbs_sugars, fiber, protein, salt,
  }
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

  return parseFromText(text)
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
