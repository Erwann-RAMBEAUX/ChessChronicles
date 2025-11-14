/** Global frontend configuration constants */
// Seuil après lequel on ralentit la cadence de chargement (mais on ne coupe plus)
export const THROTTLE_THRESHOLD = 5000
// Débit maximal (éléments par seconde) au-delà du seuil
export const THROTTLE_RATE = 1000
export const FLUSH_MS = 250
export const FLUSH_COUNT = 300
export const CONCURRENCY = 2

// ========== API Configuration ==========
// URL de base du backend - utilise VITE_BACKEND_URL en env ou localhost par défaut
// Pour changer facilement lors du déploiement:
//   - Dev: http://localhost:5000
//   - Prod: https://api.yourserver.com
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

export const API_ENDPOINTS = {
  // Endpoints pour récupérer les PGN (via notre backend)
  game: {
    live: (id: string) => `${BACKEND_URL}/game/live/${encodeURIComponent(id)}`,
    daily: (id: string) => `${BACKEND_URL}/game/daily/${encodeURIComponent(id)}`,
  },
}

