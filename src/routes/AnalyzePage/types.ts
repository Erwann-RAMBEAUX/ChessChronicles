type NavState = {
  username?: string;
  analyze?: boolean;
  pgn?: string;
  error?: string;
  white?: { username: string; rating?: number };
  black?: { username: string; rating?: number };
};

export type { NavState };
