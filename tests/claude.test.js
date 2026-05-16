import { describe, it, expect, vi } from 'vitest'

// Mock @anthropic-ai/sdk before importing claude.js
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class Anthropic {
      constructor() {}
      get messages() {
        return {
          create: vi.fn()
        }
      }
    }
  }
})

const { parseExtractedJson, buildPrompt } = await import('../electron/claude.js')

describe('parseExtractedJson', () => {
  it('parses valid JSON from response text', () => {
    const text = JSON.stringify({
      product_name: 'Wafels Melk',
      ingredients: 'Ingrediënten: tarwe, suiker',
      allergens: 'Kan bevatten: noten',
      storage_info: 'Bewaren op kamertemperatuur',
      manufacturer: 'Roshen Europe',
      net_weight: '100g',
      energy_kj: '2187',
      energy_kcal: '521',
      fat_total: '36',
      fat_saturated: '16',
      carbs_total: '58',
      carbs_sugars: '33',
      fiber: '0.5',
      protein: '6.6',
      salt: '0.36',
    })
    const result = parseExtractedJson(text)
    expect(result.product_name).toBe('Wafels Melk')
    expect(result.energy_kj).toBe('2187')
  })

  it('extracts JSON from text containing extra prose', () => {
    const text = 'Here is the data:\n```json\n{"product_name":"Koekjes","ingredients":"Ingrediënten: meel","allergens":"","storage_info":"","manufacturer":"","net_weight":"50g","energy_kj":"1800","energy_kcal":"430","fat_total":"10","fat_saturated":"5","carbs_total":"70","carbs_sugars":"40","fiber":"1","protein":"3","salt":"0.2"}\n```'
    const result = parseExtractedJson(text)
    expect(result.product_name).toBe('Koekjes')
  })

  it('returns null for unparseable text', () => {
    expect(parseExtractedJson('no json here at all')).toBeNull()
  })
})

describe('buildPrompt', () => {
  it('returns a non-empty string', () => {
    expect(typeof buildPrompt()).toBe('string')
    expect(buildPrompt().length).toBeGreaterThan(50)
  })
})
