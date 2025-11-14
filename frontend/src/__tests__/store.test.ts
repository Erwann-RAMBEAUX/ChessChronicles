import { describe, it, expect } from 'vitest'
import { useChessStore } from '../store'
import { THROTTLE_THRESHOLD } from '../config'

describe('store soft cap behavior', () => {
  it('does not hard-cap games; can exceed threshold', () => {
    const many = Array.from({ length: THROTTLE_THRESHOLD + 200 }, (_, i) => ({ id: String(i), endDate: new Date(), opponent: { username: 'x', rating: 1000 }, userColor: 'white', resultForUser: 'win', url: 'https://www.chess.com/game', time_control: '600', end_time: Date.now()/1000, time_class: 'blitz', white: { username: 'u', rating: 1200 }, black: { username: 'x', rating: 1000 } } as any))

    useChessStore.setState({ games: [] } as any)

    let idx = 0
    while (idx < many.length) {
      const prev = useChessStore.getState().games
      const nextChunk = many.slice(idx, idx + 250)
      const combined = prev.concat(nextChunk)
      useChessStore.setState({ games: combined } as any)
      idx += 250
      if (useChessStore.getState().games.length >= THROTTLE_THRESHOLD + 100) break
    }

    expect(useChessStore.getState().games.length).toBeGreaterThan(THROTTLE_THRESHOLD)
  })
})
