import { Classification } from '../../types/evaluation';
import type { MoveAnalysis, PlayerStats } from './types';

export const parseUciScore = (line: string) => {
  const parts = line.split(' ');
  const idx = parts.indexOf('score');
  if (idx === -1) return null;
  if (parts[idx + 1] === 'cp') {
    const cp = parseInt(parts[idx + 2], 10);
    return { cp };
  }
  if (parts[idx + 1] === 'mate') {
    const m = parseInt(parts[idx + 2], 10);
    return { mate: m };
  }
  return null;
};

export const calculateStats = (moves: MoveAnalysis[]): PlayerStats => {
  const stats: PlayerStats = {
    brilliant: 0,
    critical: 0,
    best: 0,
    excellent: 0,
    okay: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
    theory: 0,
    total: moves.length,
  };

  moves.forEach((move) => {
    switch (move.classification) {
      case Classification.BRILLIANT:
        stats.brilliant++;
        break;
      case Classification.CRITICAL:
        stats.critical++;
        break;
      case Classification.THEORY:
        stats.theory++;
        break;
      case Classification.BEST:
        stats.best++;
        break;
      case Classification.EXCELLENT:
        stats.excellent++;
        break;
      case Classification.OKAY:
        stats.okay++;
        break;
      case Classification.INACCURACY:
        stats.inaccuracy++;
        break;
      case Classification.MISTAKE:
        stats.mistake++;
        break;
      case Classification.BLUNDER:
        stats.blunder++;
        break;
    }
  });

  return stats;
};
