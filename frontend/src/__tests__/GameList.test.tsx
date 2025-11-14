import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameList } from '../components/GameList'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import { useChessStore } from '../store'
import type { Game } from '../types'
import { MemoryRouter } from 'react-router-dom'

function makeGame(id: number, username: string): Game {
  const base: any = {
    url: `https://www.chess.com/game/live/${id}`,
    time_control: '600',
    end_time: 1700000000 + id,
    time_class: 'blitz',
    white: { username: 'User', rating: 1500, result: 'win' },
    black: { username: username, rating: 1400, result: 'loss' },
  }
  const endDate = new Date((1700000000 + id) * 1000)
  const userColor: 'white' | 'black' = 'white'
  const opponent = base.black
  const resultForUser: 'win' | 'loss' | 'draw' = 'win'
  const idStr = `${base.url}#${base.end_time}`
  return { ...base, endDate, userColor, opponent, resultForUser, id: idStr }
}

describe('GameList pagination', () => {
  beforeEach(() => {
    useChessStore.setState({ username: 'User', games: [], page: 1, pageSize: 15 } as any)
    // Build 40 games
    const games: Game[] = []
    for (let i = 0; i < 40; i++) {
      games.push(makeGame(i, `opp-${i}`))
    }
    useChessStore.setState({ games } as any)
  })

  it('shows page-sized items and paginates on click', () => {
    render(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <GameList />
        </I18nextProvider>
      </MemoryRouter>
    )
    // Sorting is newest-first by default, so page 1 shows highest indexes first: 39..25
    for (let i = 39; i >= 25; i--) {
      expect(screen.getByText((c) => c.includes(`opp-${i}`))).toBeInTheDocument()
    }
    // Click page 2 (should show 24..10)
    const btn2 = screen.getByRole('button', { name: '2' })
    fireEvent.click(btn2)
    for (let i = 24; i >= 10; i--) {
      expect(screen.getByText((c) => c.includes(`opp-${i}`))).toBeInTheDocument()
    }
    // On 3 pages, no ellipsis is expected; ensure buttons 1..3 are present
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()
  })
})
