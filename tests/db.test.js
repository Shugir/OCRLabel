import { describe, it, expect, beforeEach } from 'vitest'

// Use in-memory DB for tests
process.env.OCRLABEL_DB_PATH = ':memory:'

const { initDb, saveLabel, listLabels, getLabel, deleteLabel, markPrinted } =
  await import('../electron/db.js')

const sample = {
  image_path: '/tmp/test.jpg',
  product_name: 'Testkoekjes',
  ingredients: 'Ingrediënten: tarwe, suiker',
  allergens: 'Kan bevatten: noten',
  storage_info: 'Bewaren op kamertemperatuur',
  manufacturer: 'Test BV, Amsterdam',
  net_weight: '100g',
  energy_kj: '2000',
  energy_kcal: '478',
  fat_total: '20',
  fat_saturated: '10',
  carbs_total: '60',
  carbs_sugars: '30',
  fiber: '2',
  protein: '5',
  salt: '0.5',
}

describe('db', () => {
  beforeEach(() => initDb())

  it('saves and retrieves a label', () => {
    const id = saveLabel(sample)
    const row = getLabel(id)
    expect(row.product_name).toBe('Testkoekjes')
    expect(row.energy_kj).toBe('2000')
    expect(row.printed_at).toBeNull()
  })

  it('lists all labels newest first', () => {
    saveLabel(sample)
    saveLabel({ ...sample, product_name: 'Ander product' })
    const rows = listLabels()
    expect(rows.length).toBe(2)
    expect(rows[0].product_name).toBe('Ander product')
  })

  it('deletes a label', () => {
    const id = saveLabel(sample)
    deleteLabel(id)
    expect(getLabel(id)).toBeUndefined()
  })

  it('marks a label as printed', () => {
    const id = saveLabel(sample)
    markPrinted(id)
    const row = getLabel(id)
    expect(row.printed_at).not.toBeNull()
  })
})
