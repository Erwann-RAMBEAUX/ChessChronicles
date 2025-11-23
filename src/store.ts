import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { streamUserGames } from './api/chessCom';
import { THROTTLE_THRESHOLD, THROTTLE_RATE, FLUSH_COUNT, FLUSH_MS, CONCURRENCY } from './config';
import { ApiError } from './api/chessCom';
import type { Filters, Game, SortBy } from './types';
import type { AnalysisResult } from './hooks/useAnalysis';

/** Root application store state */
type State = {
  username: string;
  games: Game[];
  loading: boolean;
  error?: string;
  errorDetails?: string;
  filters: Filters;
  suggestions: string[];
  page: number;
  pageSize: number;
  loadId?: number;
  abortCtl?: AbortController | null;
  stockfishVersion: 'lite' | 'normal';
  stockfishDepth: number;
  soundsEnabled: boolean;
  currentGame?: {
    pgn: string;
    username?: string;
    analyze?: boolean;
    white?: { username: string; rating?: number };
    black?: { username: string; rating?: number };
    analysis?: AnalysisResult;
  };
};

/** Store actions for UI and data flow */
type Actions = {
  setUsername: (u: string) => void;
  reset: () => void;
  abort: () => void;
  loadGames: () => Promise<void>;
  updateFilters: (p: Partial<Filters>) => void;
  setPage: (n: number) => void;
  setPageSize: (n: number) => void;
  setStockfishVersion: (v: 'lite' | 'normal') => void;
  setStockfishDepth: (d: number) => void;
  setSoundsEnabled: (enabled: boolean) => void;
  setCurrentGame: (game?: State['currentGame']) => void;
  clearCurrentGame: () => void;
};

/** Initial/default filter configuration */
const defaultFilters: Filters = {
  color: 'all',
  results: 'all',
  modes: ['bullet', 'blitz', 'rapid', 'daily'],
  month: 'all',
  opponentQuery: '',
  sortBy: 'date',
  sortDir: 'desc',
};

export const useChessStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      username: '',
      games: [],
      loading: false,
      error: undefined,
      errorDetails: undefined,
      filters: defaultFilters,
      suggestions: [],
      page: 1,
      pageSize: 15,
      abortCtl: null,
      stockfishVersion: 'lite',
      stockfishDepth: 16,
      soundsEnabled: true,
      currentGame: undefined,
      setUsername: (u) => set({ username: u, page: 1, error: undefined, errorDetails: undefined }),
      reset: () =>
        set({
          games: [],
          loading: false,
          error: undefined,
          errorDetails: undefined,
          filters: defaultFilters,
          suggestions: [],
          page: 1,
        }),
      setCurrentGame: (game) => set({ currentGame: game }),
      clearCurrentGame: () => set({ currentGame: undefined }),
      abort: () => {
        try {
          get().abortCtl?.abort();
        } catch {
        }
        set({ abortCtl: null });
      },
      updateFilters: (p) => set((s) => ({ filters: { ...s.filters, ...p }, page: 1 })),
      setPage: (n) => set({ page: Math.max(1, Math.floor(n) || 1) }),
      setPageSize: (n) => set({ pageSize: Math.max(1, Math.floor(n) || 15), page: 1 }),
      setStockfishVersion: (v) => set({ stockfishVersion: v }),
      setStockfishDepth: (d) => set({ stockfishDepth: Math.max(1, Math.min(30, d)) }),
      setSoundsEnabled: (enabled) => set({ soundsEnabled: enabled }),
      loadGames: async () => {
        const username = get().username.trim();
        if (!username) return;
        try {
          get().abortCtl?.abort();
        } catch {
        }
        const newId = Date.now();
        const ctl = new AbortController();
        set({
          games: [],
          loading: true,
          error: undefined,
          suggestions: [],
          page: 1,
          loadId: newId,
          abortCtl: ctl,
        });
        const seenOpp = new Set<string>();
        let buffer: Game[] = [];
        let lastFlush = Date.now();
        const FLUSH_MS_CFG = FLUSH_MS;
        const FLUSH_COUNT_CFG = FLUSH_COUNT;

        /**
         * Flush buffered games and update suggestions atomically.
         * Also enforces a max history window to cap memory.
         */
        const flush = () => {
          if (!buffer.length) return;
          if (get().loadId !== newId) {
            buffer = [];
            return;
          }
          const add = buffer;
          buffer = [];
          set((s) => {
            const games = s.games.concat(add);
            for (const g of add) {
              const op = g.opponent.username;
              if (!seenOpp.has(op)) seenOpp.add(op);
            }
            const cap = 2000;
            const suggestions = Array.from(seenOpp).slice(0, cap);
            return { games, suggestions };
          });
        };
        try {
          let tokens = THROTTLE_RATE;
          let lastRefill = Date.now();
          for await (const g of streamUserGames(username, {
            concurrency: CONCURRENCY,
            signal: ctl.signal,
          })) {
            if (get().loadId !== newId) break;
            buffer.push(g);
            const now = Date.now();
            if (buffer.length >= FLUSH_COUNT_CFG || now - lastFlush >= FLUSH_MS_CFG) {
              flush();
              lastFlush = now;
              await new Promise((r) => setTimeout(r, 0));
            }
            const projected = get().games.length + buffer.length;
            if (projected >= THROTTLE_THRESHOLD) {
              const now2 = Date.now();
              const elapsed = now2 - lastRefill;
              if (elapsed > 0) {
                const refill = Math.floor((elapsed / 1000) * THROTTLE_RATE);
                if (refill > 0) {
                  tokens = Math.min(THROTTLE_RATE, tokens + refill);
                  lastRefill = now2;
                }
              }
              if (tokens <= 0) {
                await new Promise((r) => setTimeout(r, 1));
                continue;
              }
              tokens -= 1;
            }
          }
          flush();
        } catch (e: unknown) {
          const name =
            e && typeof e === 'object' && 'name' in e ? (e as { name?: string }).name : undefined;
          if (name !== 'AbortError') {
            let msg =
              e && typeof e === 'object' && 'message' in e
                ? ((e as { message?: string }).message ?? 'Erreur inconnue')
                : 'Erreur inconnue';
            if (e instanceof ApiError) {
              msg = e.code;
            } else if (/Failed to fetch/i.test(msg)) {
              msg = 'common.error.offline';
            }
            const stack =
              e && typeof e === 'object' && 'stack' in e
                ? (e as { stack?: unknown }).stack
                : undefined;
            set({ error: msg, errorDetails: String(stack ?? e) });
          }
        } finally {
          if (get().loadId === newId) set({ loading: false, abortCtl: null });
        }
      },
    }),
    {
      name: 'chesschronicles-store',
      partialize: (s) => ({
        username: s.username,
        stockfishVersion: s.stockfishVersion,
        stockfishDepth: s.stockfishDepth,
        soundsEnabled: s.soundsEnabled,
        currentGame: s.currentGame,
      }),
    }
  )
);

/**
 * Derived selector: apply filters and sorting, returning the final list.
 * Note: Sorting is applied after all filters for performance and clarity.
 */
export function useFilteredGames(): Game[] {
  const { games, filters, username } = useChessStore();
  const q = filters.opponentQuery.toLowerCase();
  const seen = games.slice().filter((g) => {
    if (filters.color !== 'all' && g.userColor !== filters.color) return false;
    if (filters.results !== 'all' && g.resultForUser !== filters.results) return false;
    if (filters.modes.length > 0 && !filters.modes.includes(g.time_class)) return false;
    if (filters.month !== 'all') {
      const ym = `${g.endDate.getFullYear()}-${String(g.endDate.getMonth() + 1).padStart(2, '0')}`;
      if (ym !== filters.month) return false;
    }
    if (q && !g.opponent.username.toLowerCase().includes(q)) return false;
    if (
      g.white.username.toLowerCase() !== username.toLowerCase() &&
      g.black.username.toLowerCase() !== username.toLowerCase()
    )
      return false;
    return true;
  });
  const by: SortBy = filters.sortBy;
  const dir = filters.sortDir === 'asc' ? 1 : -1;
  const getUserRating = (g: Game) => g[g.userColor].rating ?? 0;
  const getOppRating = (g: Game) => g.opponent.rating ?? 0;
  return seen.sort((a, b) => {
    switch (by) {
      case 'date':
        return dir * (a.endDate.getTime() - b.endDate.getTime());
      case 'elo_opponent':
        return dir * (getOppRating(a) - getOppRating(b));
      case 'elo_user':
        return dir * (getUserRating(a) - getUserRating(b));
      default:
        return dir * (a.endDate.getTime() - b.endDate.getTime());
    }
  });
}
