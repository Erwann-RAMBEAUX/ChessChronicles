import { derivePerspective, type Game, type RawGame, type PlayerProfile, type PlayerStats, type StreamerInfo } from '../types'
import { API_ENDPOINTS } from '../config'

export class ApiError extends Error {
  code: string
  params?: Record<string, unknown>
  constructor(code: string, params?: Record<string, unknown>) {
    super(code)
    this.name = 'ApiError'
    this.code = code
    this.params = params
  }
}

// Base URL for Chess.com public player endpoints
const BASE = 'https://api.chess.com/pub/player'

/**
 * Helper: build a human-friendly message for HTTP errors.
 */
function httpErrorCode(status: number, context: 'archives' | 'month' | 'profile' | 'stats'): { code: string; params?: Record<string, unknown> } {
  if (status === 404) {
    if (context === 'archives' || context === 'profile') return { code: 'error.userNotFound' }
    if (context === 'stats') return { code: 'error.statsUnavailable' }
    return { code: 'error.archiveNotFound' }
  }
  if (status === 429) return { code: 'error.tooManyRequests' }
  if (status >= 500 && status < 600) return { code: 'error.server' }
  return { code: 'error.http', params: { status } }
}

/**
 * Helper: robust fetch JSON with friendly network/HTTP error messages.
 */
function getErrorName(e: unknown): string | undefined {
  if (typeof e === 'object' && e !== null && 'name' in e) {
    const val = (e as Record<string, unknown>).name
    return typeof val === 'string' ? val : undefined
  }
  return undefined
}

async function safeFetchJson<T>(url: string, signal: AbortSignal | undefined, context: 'archives' | 'month' | 'profile' | 'stats'): Promise<T> {
  try {
    const res = await fetch(url, { signal })
    if (!res.ok) {
      const { code, params } = httpErrorCode(res.status, context)
      throw new ApiError(code, params)
    }
    return res.json()
  } catch (e: unknown) {
    if (getErrorName(e) === 'AbortError') throw e
    // TypeError from fetch => often offline/DNS
    if (e instanceof TypeError) {
      throw new ApiError('error.offline')
    }
    // If our own Error above, just rethrow
    if (e instanceof ApiError) throw e
    if (e instanceof Error) throw new ApiError('error.unknown')
    throw new ApiError('error.unknown')
  }
}

/** Try to fetch a single game payload by a chess.com game id. Uses our backend exclusively (Chess.com blocks browser requests). */
export async function fetchGameById(id: string, signal?: AbortSignal, gameType: 'live' | 'daily' = 'live'): Promise<RawGame | null> {
  // Use our backend only (Chess.com blocks browser requests)
  const url = gameType === 'daily' 
    ? API_ENDPOINTS.game.daily(id)
    : API_ENDPOINTS.game.live(id)
  
  try {
    const res = await fetch(url, { signal })
    
    if (!res.ok) {
      return null
    }

    const data = await res.json().catch(() => null)

    if (!data) {
      return null
    }

    const gameData = data.game || data
    const playersData = data.players

    if (!gameData || !playersData) {
      return null
    }

    // Extract player data
    const whitePlayer = playersData.bottom // white is always at bottom
    const blackPlayer = playersData.top   // black is always at top

    if (!whitePlayer?.username || !blackPlayer?.username) {
      return null
    }

    // Build RawGame
    const raw: RawGame = {
      url: `https://www.chess.com/game/${gameType === 'daily' ? 'daily' : 'live'}/${id}`,
      pgn: gameData.pgn || undefined,
      pgnHeadersRaw: gameData.pgnHeaders,
      moveListEncoded: gameData.moveList,
      time_control: gameData.pgnHeaders?.TimeControl || '',
      end_time: gameData.endTime || Math.floor(Date.now() / 1000),
      rated: gameData.isRated || false,
      resultMessage: gameData.resultMessage,
      time_class: gameData.type === 'chess' ? (gameData.typeName?.includes('Daily') ? 'daily' : 'blitz') : 'blitz',
      white: {
        username: whitePlayer.username,
        rating: whitePlayer.rating,
      },
      black: {
        username: blackPlayer.username,
        rating: blackPlayer.rating,
      },
    }
    return raw
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') throw e
    return null
  }
}

/** Fetch list of monthly archive URLs for a player. */
export async function fetchArchives(username: string, signal?: AbortSignal): Promise<string[]> {
  const data = await safeFetchJson<{ archives: string[] }>(`${BASE}/${encodeURIComponent(username)}/games/archives`, signal, 'archives')
  return data.archives as string[]
}

/** Fetch all games for a monthly archive URL. */
export async function fetchMonth(url: string, signal?: AbortSignal): Promise<RawGame[]> {
  const data = await safeFetchJson<{ games?: RawGame[] }>(url, signal, 'month')
  return (data.games || []) as RawGame[]
}

/**
 * Stream games for a user, yielding progressively month by month.
 * Honors AbortSignal to cancel immediately on new searches.
 */
export async function* streamUserGames(
  username: string,
  options?: { concurrency?: number; signal?: AbortSignal }
): AsyncGenerator<Game, void, unknown> {
  const concurrency = options?.concurrency ?? 2
  const signal = options?.signal
  if (signal?.aborted) return
  const archives = await fetchArchives(username, signal)
  // Most recent first
  const months = [...archives].reverse()

  let i = 0
  const queue: Promise<{ url: string; games: RawGame[] } | null>[] = []

  const startNext = () => {
    if (i >= months.length) return null
    const url = months[i++]
    const p = fetchMonth(url, signal)
      .then(games => ({ url, games }))
      .catch(() => null)
    return p
  }

  // seed
  for (let k = 0; k < concurrency; k++) {
    const p = startNext()
    if (p) queue.push(p)
  }

  while (queue.length) {
    if (signal?.aborted) break
    const settled = await Promise.race(queue.map((p, idx) => p!.then(v => ({ v, idx }))))
    queue.splice(settled.idx, 1)
    const payload = settled.v
    if (payload) {
      for (const g of payload.games) {
        const meta = derivePerspective(g, username)
        yield { ...g, ...meta }
      }
    }
    if (signal?.aborted) break
    const next = startNext()
    if (next) queue.push(next)
    // micro-yield to avoid blocking UI thread
    await new Promise(r => setTimeout(r, 0))
  }
}

/** Fetch basic public profile for a player. */
export async function fetchProfile(username: string, signal?: AbortSignal): Promise<PlayerProfile> {
  return safeFetchJson<PlayerProfile>(`${BASE}/${encodeURIComponent(username)}`, signal, 'profile')
}

/** Fetch rating stats for multiple time classes. */
export async function fetchStats(username: string, signal?: AbortSignal): Promise<PlayerStats> {
  return safeFetchJson<PlayerStats>(`${BASE}/${encodeURIComponent(username)}/stats`, signal, 'stats')
}

/** Fetch Twitch presence from Chess.com streamers directory. */
export async function fetchStreamerInfo(username: string): Promise<StreamerInfo | null> {
  try {
    const res = await fetch(`https://api.chess.com/pub/streamers`)
    if (!res.ok) return null
    const data = await res.json()
    type StreamerRaw = { username?: string; chess_com_username?: string; twitch_url?: string; url?: string; stream_url?: string; is_live?: boolean }
    const list: StreamerRaw[] = Array.isArray(data?.streamers) ? (data.streamers as StreamerRaw[]) : []
    const u = username.toLowerCase()
    const found = list.find(s => (s.username?.toLowerCase?.() === u) || (s.chess_com_username?.toLowerCase?.() === u))
    if (found) {
      const candidates = [found.twitch_url, found.url, found.stream_url].filter((x): x is string => typeof x === 'string')
      const tUrl = candidates.find(u => u.includes('twitch.tv'))
      return { twitch_url: tUrl, is_live: !!found.is_live }
    }
    return null
  } catch {
    return null
  }
}