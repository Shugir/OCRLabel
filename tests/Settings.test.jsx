// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Settings from '../src/screens/Settings.jsx'

beforeEach(() => {
  window.api = {
    config: {
      get: vi.fn().mockResolvedValue({ anthropicApiKey: 'sk-existing', printerName: 'TestPrinter' }),
      set: vi.fn().mockResolvedValue(undefined),
    },
  }
})

describe('Settings', () => {
  it('loads and displays existing config values', async () => {
    render(<Settings />)
    await waitFor(() => {
      expect(screen.getByDisplayValue('TestPrinter')).toBeInTheDocument()
    })
  })

  it('calls config.set when save is clicked', async () => {
    render(<Settings />)
    await waitFor(() => screen.getByDisplayValue('TestPrinter'))
    fireEvent.change(screen.getByLabelText(/printernaam/i), { target: { value: 'Brother QL-810W' } })
    fireEvent.click(screen.getByRole('button', { name: /opslaan/i }))
    await waitFor(() => {
      expect(window.api.config.set).toHaveBeenCalledWith('printerName', 'Brother QL-810W')
    })
  })
})
