export type RawPlayer = {
  username: string
  rating?: number
  result?: string
}

export type RawGame = {
  url: string
  pgn?: string
  pgnHeadersRaw?: Record<string, any>
  moveListEncoded?: string
  time_control: string
  end_time: number
  rated?: boolean
  tcn?: string
  uuid?: string
  initial_setup?: string
  fen?: string
  time_class: 'daily' | 'rapid' | 'blitz' | 'bullet' | string
  rules?: string
  resultMessage?: string
  white: RawPlayer
  black: RawPlayer
}

export type Game = RawGame & {
  id: string
  opponent: RawPlayer
  userColor: 'white' | 'black'
  resultForUser: 'win' | 'loss' | 'draw'
  endDate: Date
  gameType: 'live' | 'daily' // Game type for routing to correct endpoints
}

export type Filters = {
  color: 'all' | 'white' | 'black'
  results: 'all' | 'win' | 'loss' | 'draw'
  modes: 'all' | 'bullet' | 'blitz' | 'rapid' | 'daily'
  month: 'all' | string // YYYY-MM
  opponentQuery: string
  sortBy: SortBy
  sortDir: SortDir
}

export function formatMonth(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function derivePerspective(game: RawGame, username: string): Pick<Game, 'userColor' | 'resultForUser' | 'opponent' | 'endDate' | 'id' | 'gameType'> {
  const isWhite = game.white.username.toLowerCase() === username.toLowerCase()
  const userColor = isWhite ? 'white' : 'black'
  const opponent = isWhite ? game.black : game.white
  const userRes = (isWhite ? game.white.result : game.black.result) || ''
  let resultForUser: 'win' | 'loss' | 'draw'
  if (userRes === 'win') resultForUser = 'win'
  else if (['agreed', 'stalemate', 'repetition', 'insufficient', '50move', 'timevsinsufficient'].includes(userRes)) resultForUser = 'draw'
  else resultForUser = 'loss'
  const endDate = new Date(game.end_time * 1000)
  const id = `${game.url}#${game.end_time}`
  
  // Determine game type (live or daily) based on time_class
  const gameType: 'live' | 'daily' = game.time_class === 'daily' ? 'daily' : 'live'
  
  return { userColor, resultForUser, opponent, endDate, id, gameType }
}

// Profile & Stats types (subset of Chess.com API)
export type PlayerProfile = {
  avatar?: string
  player_id: number
  url: string
  username: string
  name?: string
  title?: string
  followers?: number
  country?: string // URL ending with /{CC}
  last_online?: number
  joined?: number
  status?: string
  is_streamer?: boolean
  verified?: boolean
  league?: string
  twitch_url?: string
  streaming_platforms?: Array<{ type?: string; channel_url?: string }>
}

export type TimeClassKey = 'chess_bullet' | 'chess_blitz' | 'chess_rapid' | 'chess_daily'

export type TimeClassStats = {
  last?: { rating?: number; date?: number; rd?: number }
  best?: { rating?: number; date?: number; game?: string }
  record?: { win?: number; loss?: number; draw?: number; time_per_move?: number; timeout_percent?: number }
}

export type PlayerStats = {
  chess_bullet?: TimeClassStats
  chess_blitz?: TimeClassStats
  chess_rapid?: TimeClassStats
  chess_daily?: TimeClassStats
  tactics?: { highest?: { rating?: number; date?: number } }
  puzzle_rush?: { best?: { total_attempts?: number; score?: number } }
}

export function countryFromUrl(url?: string): string | undefined {
  if (!url) return undefined
  const cc = url.split('/').pop() || ''
  return cc || undefined
}

export function countryFlagEmoji(cc?: string): string | undefined {
  if (!cc) return undefined
  const code = cc.toUpperCase()
  if (code.length !== 2) return undefined
  const A = 0x1f1e6
  return String.fromCodePoint(A + (code.charCodeAt(0) - 65)) + String.fromCodePoint(A + (code.charCodeAt(1) - 65))
}

export type StreamerInfo = {
  twitch_url?: string
  is_live?: boolean
}

export type SortBy = 'date' | 'elo_opponent' | 'elo_user'
export type SortDir = 'asc' | 'desc'

