import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { useFilteredGames } from '../store'
import type { Game } from '../types'

// Minimal harness: we can't render React store easily without provider, but useFilteredGames reads Zustand directly.
// We'll simulate state by temporarily setting store values via the hook's store import.
import { useChessStore } from '../store'

function HookHarness() {
  const items = useFilteredGames()
  return <div data-testid="ids">{items.map(g => g.id).join(',')}</div>
}

function makeGame(id: string, overrides: Partial<Game>): Game {
  const base: any = {
    url: 'https://www.chess.com/game/live/123',
    time_control: '600',
    end_time: 1700000000,
    time_class: 'blitz',
    white: { username: 'User', rating: 1500 },
    black: { username: 'opponent', rating: 1500 },
    id,
    opponent: { username: 'opponent', rating: 1500 },
    userColor: 'white',
    resultForUser: 'win',
    endDate: new Date(1700000000*1000),
  }
  return { ...base, ...overrides }
}

describe('useFilteredGames', () => {
  it('filters by opponent query and month', () => {
    const g1 = makeGame('1', { opponent: { username: 'Alpha', rating: 1500 }, endDate: new Date('2024-06-10') as any })
    const g2 = makeGame('2', { opponent: { username: 'Beta', rating: 1500 }, endDate: new Date('2024-07-11') as any })

    useChessStore.setState({
      username: 'User',
      games: [g1, g2],
      filters: {
        color: 'all',
        results: 'all',
        modes: 'all',
        month: '2024-07',
        opponentQuery: 'be',
        sortBy: 'date',
        sortDir: 'desc'
      },
      suggestions: [], page: 1, pageSize: 15
    } as any)

    render(<HookHarness />)
    const text = screen.getByTestId('ids').textContent || ''
    const ids = text ? text.split(',') : []
    expect(ids).toEqual(['2'])
    cleanup()
  })

  it('sorts by opponent elo asc', () => {
    const g1 = makeGame('1', { opponent: { username: 'A', rating: 1800 }, endDate: new Date('2024-07-01') as any })
    const g2 = makeGame('2', { opponent: { username: 'B', rating: 1600 }, endDate: new Date('2024-07-02') as any })

    useChessStore.setState({
      username: 'User',
      games: [g1, g2],
      filters: {
        color: 'all', results: 'all', modes: 'all',
        month: 'all', opponentQuery: '', sortBy: 'elo_opponent', sortDir: 'asc'
      },
      suggestions: [], page: 1, pageSize: 15
    } as any)

    render(<HookHarness />)
    const text = screen.getByTestId('ids').textContent || ''
    const ids = text ? text.split(',') : []
    expect(ids).toEqual(['2','1'])
    cleanup()
  })
})
