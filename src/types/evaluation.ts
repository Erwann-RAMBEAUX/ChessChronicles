/**
 * Evaluation types based on wintrchess structure
 */

export interface Evaluation {
  type: 'centipawn' | 'mate';
  value: number;
}

export enum Classification {
  BRILLIANT = 'brilliant',
  CRITICAL = 'critical',
  BEST = 'best',
  EXCELLENT = 'excellent',
  OKAY = 'okay',
  INACCURACY = 'inaccuracy',
  MISTAKE = 'mistake',
  BLUNDER = 'blunder',
  THEORY = 'theory',
}
