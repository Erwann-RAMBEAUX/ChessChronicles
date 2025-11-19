import type { Chess } from 'chess.js';

export interface GameResult {
  result: string | null;
  termination: string | null;
}

export interface GameDataReturn {
  pgn: string | undefined;
  loading: boolean;
  error: string | null;
  moves: string[];
  headers: Record<string, string>;
  chessAt: Chess;
  lastMoveSquares: Record<string, unknown>;
  lastMoveSquareInfo: { from: string | null; to: string | null };
  index: number;
  setIndex: (index: number) => void;
  manualPgn: boolean;
  setManualPgn: (pgn: string) => void;
  clearManualPgn: () => void;
  retryFetch: () => void;
  resultMessage: string | undefined;
}
