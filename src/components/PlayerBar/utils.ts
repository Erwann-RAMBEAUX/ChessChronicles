import type { PlayerStats } from '../../hooks/useAnalysis';

export function calculateAccuracy(stats: PlayerStats): number {
  if (stats.total === 0) return 100;
  const goodMoves = stats.total - stats.blunder - stats.mistake - stats.inaccuracy;
  return Math.round((goodMoves / stats.total) * 100);
}
