// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LabelForm from '../src/components/LabelForm.jsx'

const empty = {
  product_name: '', ingredients: '', allergens: '', storage_info: '',
  manufacturer: '', net_weight: '', energy_kj: '', energy_kcal: '',
  fat_total: '', fat_saturated: '', carbs_total: '', carbs_sugars: '',
  fiber: '', protein: '', salt: '',
}

describe('LabelForm', () => {
  it('renders product name field', () => {
    render(<LabelForm data={empty} onChange={() => {}} onSave={() => {}} />)
    expect(screen.getByLabelText(/productnaam/i)).toBeInTheDocument()
  })

  it('renders all 9 nutrition fields', () => {
    render(<LabelForm data={empty} onChange={() => {}} onSave={() => {}} />)
    expect(screen.getByLabelText(/energie \(kJ\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/energie \(kcal\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/vet \(g\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/verzadigd/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/koolhydraten/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/suikers/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/vezels/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/eiwitten/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/zout/i)).toBeInTheDocument()
  })

  it('calls onChange when a field changes', () => {
    const onChange = vi.fn()
    render(<LabelForm data={empty} onChange={onChange} onSave={() => {}} />)
    fireEvent.change(screen.getByLabelText(/productnaam/i), { target: { value: 'Koekjes' } })
    expect(onChange).toHaveBeenCalledWith('product_name', 'Koekjes')
  })

  it('renders Save & Preview button', () => {
    render(<LabelForm data={empty} onChange={() => {}} onSave={() => {}} />)
    expect(screen.getByRole('button', { name: /opslaan/i })).toBeInTheDocument()
  })
})
