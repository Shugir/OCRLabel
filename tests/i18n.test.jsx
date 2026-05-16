// tests/i18n.test.jsx
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LanguageProvider, useT } from '../src/i18n.js'

function LangDisplay() {
  const { t, lang, setLang } = useT()
  return (
    <div>
      <span data-testid="labels">{t('nav_labels')}</span>
      <span data-testid="lang">{lang}</span>
      <button onClick={() => setLang('nl')}>NL</button>
      <button onClick={() => setLang('en')}>EN</button>
    </div>
  )
}

beforeEach(() => {
  window.api = {
    config: {
      get: vi.fn().mockResolvedValue({ language: 'en' }),
      set: vi.fn().mockResolvedValue(undefined),
    },
  }
})

describe('LanguageProvider', () => {
  it('defaults to english', async () => {
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    await waitFor(() => {
      expect(screen.getByTestId('labels').textContent).toBe('Labels')
    })
  })

  it('loads language from config', async () => {
    window.api.config.get.mockResolvedValue({ language: 'nl' })
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    await waitFor(() => {
      expect(screen.getByTestId('labels').textContent).toBe('Etiketten')
    })
  })

  it('switches language and persists via config.set', async () => {
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    await waitFor(() => expect(screen.getByTestId('lang').textContent).toBe('en'))
    fireEvent.click(screen.getByRole('button', { name: 'NL' }))
    expect(screen.getByTestId('labels').textContent).toBe('Etiketten')
    expect(window.api.config.set).toHaveBeenCalledWith('language', 'nl')
  })
})

describe('useT default context (no provider)', () => {
  it('returns english string without LanguageProvider', () => {
    function Bare() {
      const { t } = useT()
      return <span>{t('nav_labels')}</span>
    }
    render(<Bare />)
    expect(screen.getByText('Labels')).toBeInTheDocument()
  })
})
