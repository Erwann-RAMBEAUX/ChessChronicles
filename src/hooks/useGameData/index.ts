import { useEffect, useMemo, useState, useRef } from 'react';
import { Chess } from 'chess.js';

import { parseGameResult } from './utils';

import type { TFunction } from 'i18next';

export function useGameData(t: TFunction, pgnOverride?: string | null) {
  const [pgn, setPgn] = useState<string | undefined>(pgnOverride ?? undefined);
  const [resultMessage, setResultMessage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [manualPgn, setManualPgnFlag] = useState(!!pgnOverride);
  const pendingRef = useRef<AbortController | null>(null);

  const { moves, headers, error, gameResult } = useMemo(() => {
    const currentPgn = pgnOverride || pgn;
    if (!currentPgn) {
      return { moves: [], headers: {}, error: null, gameResult: null };
    }

    try {
      const chess = new Chess();
      chess.loadPgn(currentPgn);
      const hist = chess.history({ verbose: true }) as Array<{ san: string }>;
      const movesArray = hist.map((h) => h.san);
      const headersObj = chess.header() as Record<string, string>;

      if (movesArray.length === 0 && currentPgn.trim().length > 0) {
        const movePattern = /\d+\./;
        let errorMsg: string;
        if (!movePattern.test(currentPgn)) {
          errorMsg = t(
            'game.error.noMovesFound',
            'Aucun coup trouvé dans le PGN. Vérifiez le format.'
          );
        } else {
          errorMsg = t('analyze.error.illegalMove', 'Le PGN contient des coups invalides.');
        }
        return { moves: [], headers: {}, error: errorMsg, gameResult: null };
      }

      const result = headersObj['Result'] || null;
      const termination = headersObj['Termination'] || null;

      return {
        moves: movesArray,
        headers: headersObj,
        error: null,
        gameResult: { result, termination },
      };
    } catch (err: unknown) {
      const rawError = err instanceof Error ? err.message : 'Format invalide';

      if (rawError.includes('Expected') && rawError.includes('found')) {
        const errorMsg = t('analyze.error.invalidPgnFormat', 'Format PGN invalide.');
        return { moves: [], headers: {}, error: errorMsg, gameResult: null };
      }

      if (rawError.includes('Invalid move') || rawError.includes('invalid move')) {
        const moveMatch = rawError.match(/:\s*(.+)$/);
        const moveDetail = moveMatch ? moveMatch[1].trim() : '';
        const errorMsg = moveDetail
          ? `${t('analyze.error.invalidMove', 'Coup invalide dans le PGN')} : ${moveDetail}`
          : t('analyze.error.invalidMove', 'Coup invalide dans le PGN.');
        return { moves: [], headers: {}, error: errorMsg, gameResult: null };
      }

      if (rawError.includes('Illegal move') || rawError.includes('illegal move')) {
        return {
          moves: [],
          headers: {},
          error: t('analyze.error.illegalMove', 'Le PGN contient des coups invalides.'),
          gameResult: null,
        };
      }

      return {
        moves: [],
        headers: {},
        error: t('analyze.error.invalidPgnFormat', 'Format PGN invalide.'),
        gameResult: null,
      };
    }
  }, [pgn, pgnOverride, t]);

  useEffect(() => {
    if (pgnOverride) {
      setPgn(pgnOverride);
      setManualPgnFlag(true);
      setLoading(false);
      return;
    } else {
      if (manualPgn) {
        setPgn(undefined);
      }
    }
  }, [manualPgn, pgnOverride]);

  const setManualPgn = (rawPgn: string) => {
    setManualPgnFlag(true);
    setLoading(false);
    setPgn(rawPgn);
    setIndex(0);
  };

  const clearManualPgn = () => {
    setManualPgnFlag(false);
    setPgn(undefined);
    setIndex(0);
  };

  const retryFetch = () => {
    if (pendingRef.current) {
      pendingRef.current.abort();
      pendingRef.current = null;
    }
  };

  const chessAt = useMemo(() => {
    const game = new Chess();
    const currentPgn = pgnOverride || pgn;
    if (currentPgn) {
      try {
        game.loadPgn(currentPgn);
      } catch {}
    }
    const history = game.history();
    const target = Math.max(0, Math.min(index, history.length));
    const replay = new Chess();
    for (let i = 0; i < target; i++) replay.move(history[i] as string);
    return replay;
  }, [pgn, pgnOverride, index]);

  const lastMoveSquares = useMemo(() => {
    const currentPgn = pgnOverride || pgn;
    if (!currentPgn || index === 0) return {};
    try {
      const game = new Chess();
      game.loadPgn(currentPgn);
      const hist = game.history({ verbose: true }) as Array<{ from?: string; to?: string }>;
      const applied = hist.slice(0, index);
      const last = applied[applied.length - 1];
      if (!last?.from || !last?.to) return {};
      const styleFrom = { background: 'rgba(184, 200, 81, 0.8)' };
      const styleTo = { background: 'rgba(121, 154, 70, 0.8)' };
      return { [last.from]: styleFrom, [last.to]: styleTo };
    } catch {
      return {};
    }
  }, [pgn, pgnOverride, index]);

  const lastMoveSquareInfo = useMemo(() => {
    const currentPgn = pgnOverride || pgn;
    if (!currentPgn || index === 0) return { from: null, to: null };
    try {
      const game = new Chess();
      game.loadPgn(currentPgn);
      const hist = game.history({ verbose: true }) as Array<{ from?: string; to?: string }>;
      const applied = hist.slice(0, index);
      const last = applied[applied.length - 1];
      if (!last?.from || !last?.to) return { from: null, to: null };
      return { from: last.from, to: last.to };
    } catch {
      return { from: null, to: null };
    }
  }, [pgn, pgnOverride, index]);

  useEffect(() => {
    if (!gameResult) {
      setResultMessage(undefined);
      return;
    }

    const { result, termination } = gameResult;
    const headersRecord = headers as Record<string, string>;
    const whitePlayer = headersRecord['White'] || t('analyze.result.white', 'Les blancs');
    const blackPlayer = headersRecord['Black'] || t('analyze.result.black', 'Les noirs');

    const message = parseGameResult(result, termination, whitePlayer, blackPlayer, t);
    setResultMessage(message);
  }, [gameResult, headers, t]);

  return {
    pgn: pgnOverride || pgn,
    loading,
    error,
    moves,
    headers,
    chessAt,
    lastMoveSquares,
    lastMoveSquareInfo,
    index,
    setIndex,
    manualPgn,
    setManualPgn,
    clearManualPgn,
    retryFetch,
    resultMessage,
  };
}

export * from './types';
