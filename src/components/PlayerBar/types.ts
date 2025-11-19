import type { PlayerMeta } from '../../hooks/usePlayerAvatars';
import type { PlayerStats } from '../../hooks/useAnalysis';

export interface PlayerBarProps {
  player: PlayerMeta;
  stats?: PlayerStats;
  position?: 'top' | 'bottom';
}
