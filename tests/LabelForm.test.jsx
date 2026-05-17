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
  it('renders label text area', () => {
    render(<LabelForm data={empty} onChange={() => {}} onSave={() => {}} />)
    expect(screen.getByLabelText(/label text/i)).toBeInTheDocument()
  })

  it('renders all 9 nutrition fields', () => {
    render(<LabelForm data={empty} onChange={() => {}} onSave={() => {}} />)
    expect(screen.getByLabelText(/energy \(kJ\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/energy \(kcal\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fat \(g\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/saturated/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/carbohydrates/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sugars/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fibre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/protein/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/salt/i)).toBeInTheDocument()
  })

  it('calls onChange with ingredients when text area changes', () => {
    const onChange = vi.fn()
    render(<LabelForm data={empty} onChange={onChange} onSave={() => {}} />)
    fireEvent.change(screen.getByLabelText(/label text/i), { target: { value: 'Koekjes' } })
    expect(onChange).toHaveBeenCalledWith('ingredients', 'Koekjes')
  })

  it('renders Save button', () => {
    render(<LabelForm data={empty} onChange={() => {}} onSave={() => {}} />)
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })
})
