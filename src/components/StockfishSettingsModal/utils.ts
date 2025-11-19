export const STOCKFISH_VERSION_OPTIONS = {
  lite: 'analysis.settings.lite',
  normal: 'analysis.settings.normal',
};

export const STOCKFISH_DEPTH_LIMITS = {
  min: 1,
  max: 30,
};

export const STOCKFISH_DEFAULTS = {
  version: 'normal' as const,
  depth: 20,
};
