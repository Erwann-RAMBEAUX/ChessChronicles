import { MoveAnalysis } from '../../hooks/useAnalysis';

export interface MovesPanelProps {
  moves: string[];
  index: number;
  setIndex: (n: number | ((i: number) => number)) => void;
  loading: boolean;
  error: string | null;
  pgn?: string;
  date?: string;
  result?: string;
  openingName?: string;
  labels: {
    moves: string;
    loading: string;
    noMoves: string;
    noPGN: string;
  };
  analysisData?: {
    whiteMoves: MoveAnalysis[];
    blackMoves: MoveAnalysis[];
  } | null;
  height?: number;
  onSettingsClick?: () => void;
}

export interface MovePair {
  number: number;
  white: string;
  black: string | null;
}
