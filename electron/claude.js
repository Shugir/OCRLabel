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

  // "Energie    2187 kJ / 524 kcal" or "Энергия 2187 кДж / 524 ккал"
  const energyM = text.match(/(?:Energie|Энергия|Energy)[\s\t]+(\d+(?:[,.]\d+)?)\s*(?:kJ|кДж)\s*[\/]\s*(\d+(?:[,.]\d+)?)\s*(?:kcal|ккал)/i)
             || text.match(/(?:Energie|Энергия|Energy)[\s\S]{0,10}?(\d{3,4})\s*(?:kJ|кДж)[\s\S]{0,10}?(\d{3,4})\s*(?:kcal|ккал)/i)
  const energy_kj   = energyM ? energyM[1] : ''
  const energy_kcal = energyM ? energyM[2] : ''

  // "Vetten    30 g"  (not "waarvan")
  const fat_total     = num(/^Vetten[\s\t]+(\d+(?:[,.]\d+)?)/im)
                     || num(/Vetten[\s\t]+(\d+(?:[,.]\d+)?)/i)
  const fat_saturated = num(/verzadigde\s+vetzuren[\s\t]+(\d+(?:[,.]\d+)?)/i)
  const carbs_total   = num(/^Koolhydraten[\s\t]+(\d+(?:[,.]\d+)?)/im)
                     || num(/Koolhydraten[\s\t]+(\d+(?:[,.]\d+)?)/i)
  const carbs_sugars  = num(/suikers[\s\t]+(\d+(?:[,.]\d+)?)/i)
  const fiber         = num(/Vezels[\s\t]+(\d+(?:[,.]\d+)?)/i)
  const protein       = num(/Eiwitten[\s\t]+(\d+(?:[,.]\d+)?)/i)
  const salt          = num(/Zout[\s\t]+(\d+(?:[,.]\d+)?)/i)

  // Ingredients — up to "Kan bevatten", "Bewaren", or double newline
  const ingM = text.match(/Ingredi[eë]nten[:\s]+([\s\S]*?)(?=\n\n|Kan bevatten|Bewaren|Melkvulling|Gemiddelde|$)/i)
  const ingredients = ingM ? 'Ingrediënten: ' + ingM[1].replace(/\n/g, ' ').trim().replace(/\s+/g, ' ') : ''

  // Allergens — collect full sentence including periods
  const algM = text.match(/Kan bevatten[:\s]+([\s\S]*?)(?=\n\n|Bewaren|Melkvulling|Gemiddelde|$)/i)
  const allergens = algM ? 'Kan bevatten: ' + algM[1].replace(/\n/g, ' ').trim().replace(/\s+/g, ' ') : ''

  // Storage — collect until next section
  const storM = text.match(/Bewaren[\s\S]*?(?=\n\n|Geproduceerd|Fabrikant|Importeur|Gemiddelde|$)/i)
  const storage_info = storM ? storM[0].replace(/\n/g, ' ').trim().replace(/\s+/g, ' ') : ''

  // Manufacturer — take Fabrikant + Importeur lines
  const fabM = text.match(/(?:Fabrikant|Importeur)[:\s]+([\s\S]*?)(?=\n\n|Gemiddelde|Netto|$)/i)
  const manufacturer = fabM ? fabM[0].replace(/\n/g, ' ').trim().replace(/\s+/g, ' ') : ''

  // Net weight: "Netto gewicht: 100 g e" — strip trailing EU "e" mark
  const wtM = text.match(/Netto\s+gewicht[:\s]+([^\n,]+)/i) || text.match(/(\d+\s*g)\s*(?:e\b|$|\n)/i)
  const net_weight = wtM ? wtM[1].trim().replace(/\s+e\s*$/i, '') : ''

  // Product name: first non-empty line, strip leading "(NL) "
  const nameM = text.match(/^(?:\(NL\)\s*)?(.+)/im)
  const product_name = nameM ? nameM[1].replace(/\.$/, '').trim() : ''

  const hasAny = ingredients || allergens || energy_kj || fat_total || protein
  if (!hasAny) return null

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

module.exports = { claudeExtract, parseExtractedJson, parseFromText, buildPrompt }
