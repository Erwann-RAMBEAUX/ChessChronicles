import type { Evaluation, Classification } from '../../types/evaluation';

export interface AnalysisProgress {
  type: 'start' | 'progress' | 'complete' | 'error';
  totalMoves?: number;
  white?: string;
  black?: string;
  moveIndex?: number;
  progress?: number;
  movesAnalyzed?: number;
  error?: string;
}

export interface MoveAnalysis {
  index: number;
  san: string;
  color: 'white' | 'black';
  classification: Classification;
  best_move: string | null;
  evaluation: Evaluation;
  previous_evaluation: Evaluation | null;
}

export interface PlayerStats {
  brilliant: number;
  critical: number;
  best: number;
  excellent: number;
  okay: number;
  inaccuracy: number;
  mistake: number;
  blunder: number;
  theory: number;
  total: number;
}

export interface AnalysisResult {
  white: {
    player: string;
    stats: PlayerStats;
    moves: MoveAnalysis[];
  };
  black: {
    player: string;
    stats: PlayerStats;
    moves: MoveAnalysis[];
  };
  openingName?: string;
}
