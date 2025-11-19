import type { PlayerMeta } from '../../hooks/usePlayerAvatars';
import type { PlayerStats } from '../../hooks/useAnalysis';
import type { Classification } from '../../types/evaluation';

export interface BoardSectionProps {
  orientation: 'white' | 'black';
  chessFen: string;
  lastMoveSquares: Record<string, unknown>;
  lastMoveSquareInfo?: { from: string | null; to: string | null };
  currentMoveClassification?: Classification | null;
  bestMoveSquares?: { from: string | null; to: string | null } | null;
  topPlayer: PlayerMeta;
  bottomPlayer: PlayerMeta;
  topPlayerStats?: PlayerStats;
  bottomPlayerStats?: PlayerStats;
  onHeightChange?: (height: number) => void;
}

export interface BadgePositionInfo {
  x: number;
  y: number;
  squareSize: number;
}
