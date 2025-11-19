export type PlayerMeta = { username?: string; rating?: number; avatar?: string };

export interface UsePlayerAvatarsParams {
  stateWhite?: { username: string; rating?: number };
  stateBlack?: { username: string; rating?: number };
  headerWhite?: string;
  headerBlack?: string;
  headerWhiteElo?: string;
  headerBlackElo?: string;
}

export interface UsePlayerAvatarsReturn {
  whiteMeta: PlayerMeta;
  blackMeta: PlayerMeta;
}
