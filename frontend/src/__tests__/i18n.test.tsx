import { describe, it, expect, beforeEach } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Simple dummy component to assert a translation key
function TComp() {
  return <span>{i18n.t('search.placeholder')}</span>
}

describe('i18n basic', () => {
  beforeEach(async () => {
    // Force language to English for test determinism
    // Provide a minimal in-memory resource to avoid async HTTP backend in tests
    i18n.addResourceBundle('en', 'translation', { search: { placeholder: 'Username' } }, true, true)
    await i18n.changeLanguage('en')
  })

  it('renders English translation for placeholder', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <TComp />
      </I18nextProvider>
    )

    expect(screen.getByText(/username/i)).toBeInTheDocument()
  })
})
