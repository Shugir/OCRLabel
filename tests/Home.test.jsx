// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../src/screens/Home.jsx'

function renderHome() {
  return render(<MemoryRouter><Home /></MemoryRouter>)
}

beforeEach(() => {
  window.api = {
    label: {
      list: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(undefined),
      markPrinted: vi.fn().mockResolvedValue(undefined),
    },
    print: { label: vi.fn().mockResolvedValue(undefined) },
  }
  // suppress window.confirm
  window.confirm = vi.fn().mockReturnValue(true)
})

describe('Home', () => {
  it('shows empty state when no labels', async () => {
    renderHome()
    await waitFor(() => {
      expect(screen.getByText(/no labels yet/i)).toBeInTheDocument()
    })
  })

  it('renders label list', async () => {
    window.api.label.list.mockResolvedValue([
      { id: 1, created_at: '2026-05-16 10:00:00', product_name: 'Wafels', net_weight: '100g', printed_at: null,
        ingredients: '', allergens: '', storage_info: '', manufacturer: '',
        energy_kj: '', energy_kcal: '', fat_total: '', fat_saturated: '',
        carbs_total: '', carbs_sugars: '', fiber: '', protein: '', salt: '' },
    ])
    renderHome()
    await waitFor(() => {
      expect(screen.getByText('Wafels')).toBeInTheDocument()
    })
  })

  it('calls label.delete on delete click', async () => {
    window.api.label.list.mockResolvedValue([
      { id: 1, created_at: '2026-05-16 10:00:00', product_name: 'Wafels', net_weight: '100g', printed_at: null,
        ingredients: '', allergens: '', storage_info: '', manufacturer: '',
        energy_kj: '', energy_kcal: '', fat_total: '', fat_saturated: '',
        carbs_total: '', carbs_sugars: '', fiber: '', protein: '', salt: '' },
    ])
    renderHome()
    await waitFor(() => screen.getByText('Wafels'))
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    await waitFor(() => {
      expect(window.api.label.delete).toHaveBeenCalledWith(1)
    })
  })
})
