/** Global frontend configuration constants */

// ========== API Configuration ==========
/**
 * REST HTTP endpoint for backend
 * Used for: PGN fetching, player stats, etc.
 * Loaded from VITE_BACKEND_URL env variable
 * Default: http://localhost:8000 (matches backend default)
 */
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

/**
 * WebSocket endpoint for real-time analysis
 * Used for: game analysis streaming
 * Loaded from VITE_WS_URL env variable
 * Default: ws://localhost:8000 (matches backend default)
 */
export const WS_URL = import.meta.env.VITE_WS_URL

export const API_ENDPOINTS = {
  // Endpoints to fetch game PGN data from backend
  game: {
    live: (id: string) => `${BACKEND_URL}/game/live/${encodeURIComponent(id)}`,
    daily: (id: string) => `${BACKEND_URL}/game/daily/${encodeURIComponent(id)}`,
  },
  // WebSocket endpoint for analysis
  ws: {
    analyze: () => `${WS_URL}/ws/analyze`,
  },
}

// ========== Game Loading Configuration ==========
// Throttling thresholds for progressive game loading
export const THROTTLE_THRESHOLD = 5000
export const THROTTLE_RATE = 1000
export const FLUSH_MS = 250
export const FLUSH_COUNT = 300
export const CONCURRENCY = 2


