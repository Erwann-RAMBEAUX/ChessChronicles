import React from 'react'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import { ProfileSummary } from '../components/ProfileSummary'
import { useChessStore } from '../store'

vi.mock('../api/chessCom', () => ({
  fetchProfile: vi.fn(async (u: string) => ({ username: u, country: 'https://api.chess.com/pub/country/FR', twitch_url: 'https://twitch.tv/test' })),
  fetchStats: vi.fn(async () => ({ chess_blitz: { last: { rating: 1700 }, best: { rating: 1800, date: 1700000000 }, record: { win: 10, loss: 5, draw: 2 } } })),
  fetchStreamerInfo: vi.fn(async () => ({ twitch_url: 'https://twitch.tv/test', is_live: true }))
}))

describe('ProfileSummary', () => {
  beforeEach(async () => {
    // Minimal translations for labels used
    i18n.addResourceBundle('en', 'translation', { profile: { live: 'Live', offline: 'Offline', league: 'League', followers: 'Followers', joined: 'Joined', lastOnline: 'Last online', tacticsMax: 'Tactics max', puzzleRush: 'Puzzle Rush' } }, true, true)
    await i18n.changeLanguage('en')
    useChessStore.setState({ username: 'User' } as any)
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders Twitch link and live badge', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ProfileSummary />
      </I18nextProvider>
    )

    // Twitch link present
    const link = await screen.findByRole('link', { name: /twitch/i })
    expect(link).toHaveAttribute('href', 'https://twitch.tv/test')

    // Live badge appears
    await waitFor(() => expect(screen.getByText(/Live/)).toBeInTheDocument())
  })
})
