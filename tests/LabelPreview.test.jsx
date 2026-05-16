// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LabelPreview from '../src/components/LabelPreview.jsx'

const data = {
  product_name: 'Wafels Melk',
  ingredients: 'Ingrediënten: tarwebloem, palmolie, suiker',
  allergens: 'Kan bevatten: noten, sesam',
  storage_info: 'Bewaren op kamertemperatuur',
  manufacturer: 'Roshen Europe Sp. z o.o.',
  net_weight: '100g',
  energy_kj: '2187', energy_kcal: '521',
  fat_total: '36', fat_saturated: '16',
  carbs_total: '58', carbs_sugars: '33',
  fiber: '0.5', protein: '6.6', salt: '0.36',
}

describe('LabelPreview', () => {
  it('renders product name with (NL) prefix', () => {
    render(<LabelPreview data={data} />)
    expect(screen.getByText(/\(NL\) Wafels Melk/)).toBeInTheDocument()
  })

  it('renders ingredients text', () => {
    render(<LabelPreview data={data} />)
    expect(screen.getByText(/tarwebloem/)).toBeInTheDocument()
  })

  it('renders allergen text', () => {
    render(<LabelPreview data={data} />)
    expect(screen.getByText(/Kan bevatten: noten/)).toBeInTheDocument()
  })

  it('renders net weight', () => {
    render(<LabelPreview data={data} />)
    expect(screen.getByText(/Netto gewicht: 100g/)).toBeInTheDocument()
  })

  it('renders nutrition table', () => {
    render(<LabelPreview data={data} />)
    expect(screen.getByText(/per 100 g/i)).toBeInTheDocument()
  })
})
