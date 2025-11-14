import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameCard } from '../components/GameCard'
import type { Game } from '../types'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import { MemoryRouter } from 'react-router-dom'

const navigateMock = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const mod: any = await importOriginal()
  return {
    ...mod,
    useNavigate: () => navigateMock,
  }
})

afterEach(() => {
  navigateMock.mockReset()
})

function makeGame(overrides: Partial<Game> = {}): Game {
  const base: any = {
    url: 'https://www.chess.com/game/live/123',
    time_control: '600',
    end_time: 1700000000,
    time_class: 'blitz',
    white: { username: 'User', rating: 1500, result: 'win' },
    black: { username: 'Opp', rating: 1400, result: 'loss' },
  }
  const endDate = new Date(1700000000 * 1000)
  const userColor: 'white' | 'black' = 'white'
  const opponent = base.black
  const resultForUser: 'win' | 'loss' | 'draw' = 'win'
  const id = `${base.url}#${base.end_time}`
  const g: Game = { ...base, endDate, userColor, opponent, resultForUser, id }
  return { ...g, ...overrides }
}

describe('GameCard', () => {
  it('navigates to Game page on View', () => {
    const game = makeGame()
    render(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <GameCard game={game} />
        </I18nextProvider>
      </MemoryRouter>
    )
    const btn = screen.getByRole('button', { name: /view|voir/i })
    fireEvent.click(btn)
    expect(navigateMock).toHaveBeenCalled()
    const [path]: any = navigateMock.mock.calls[0]
    expect(path).toMatch(/\/game\//)
  })

  it('navigates to Game page on Analyze', () => {
    const game = makeGame({ url: 'https://evil.example/game/123' })
    render(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <GameCard game={game} />
        </I18nextProvider>
      </MemoryRouter>
    )
    const btn = screen.getByRole('button', { name: /analy(s|z)er|analyze/i })
    fireEvent.click(btn)
    expect(navigateMock).toHaveBeenCalled()
    const [path]: any = navigateMock.mock.calls[0]
    expect(path).toMatch(/\/game\//)
  })

  it('shows user Elo at game time when available', () => {
    const game = makeGame({ white: { username: 'User', rating: 1234, result: 'win' } as any })
    render(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <GameCard game={game} />
        </I18nextProvider>
      </MemoryRouter>
    )
    expect(screen.getByText(/1234/)).toBeInTheDocument()
  })
})
