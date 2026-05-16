// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import NutritionTable from '../src/components/NutritionTable.jsx'

const data = {
  energy_kj: '2187',
  energy_kcal: '521',
  fat_total: '36',
  fat_saturated: '16',
  carbs_total: '58',
  carbs_sugars: '33',
  fiber: '0.5',
  protein: '6.6',
  salt: '0.36',
}

describe('NutritionTable', () => {
  it('renders the header row', () => {
    render(<NutritionTable data={data} />)
    expect(screen.getByText(/per 100 g/i)).toBeInTheDocument()
  })

  it('renders energie row with kJ and kcal', () => {
    render(<NutritionTable data={data} />)
    expect(screen.getByText(/2187 kJ/)).toBeInTheDocument()
    expect(screen.getByText(/521 kcal/)).toBeInTheDocument()
  })

  it('renders all 8 nutrient rows', () => {
    render(<NutritionTable data={data} />)
    expect(screen.getByText('Energie')).toBeInTheDocument()
    expect(screen.getByText('Vetten')).toBeInTheDocument()
    expect(screen.getByText('waarvan verzadigde vetzuren')).toBeInTheDocument()
    expect(screen.getByText('Koolhydraten')).toBeInTheDocument()
    expect(screen.getByText('waarvan suikers')).toBeInTheDocument()
    expect(screen.getByText('Vezels')).toBeInTheDocument()
    expect(screen.getByText('Eiwitten')).toBeInTheDocument()
    expect(screen.getByText('Zout')).toBeInTheDocument()
  })
})
