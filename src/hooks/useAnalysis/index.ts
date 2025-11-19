import { useEffect, useRef, useState, useCallback } from 'react';
import { Chess, Move } from 'chess.js';
import { useChessStore } from '../../store';
import { Evaluation, Classification } from '../../types/evaluation';
import { classifyMove } from '../../utils/evaluation';
import { loadOpeningsDatabase, normalizeFen } from '../useOpeningsDatabase';
import type { AnalysisProgress, MoveAnalysis, AnalysisResult } from './types';
import { parseUciScore, calculateStats } from './utils';
import {
  considerBrilliantClassification,
  considerCriticalClassification,
} from '../../utils/classification';

export function useAnalysis() {
  const { stockfishVersion, stockfishDepth } = useChessStore();
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzingState] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const engineRef = useRef<Worker | null>(null);
  const isAnalyzingRef = useRef(false);
  const hasStartedRef = useRef(false);

  const startAnalysis = useCallback(
    async (pgn: string, _analyzedPlayer?: string) => {
      void _analyzedPlayer;
      if (isAnalyzingRef.current || hasStartedRef.current) return;

      hasStartedRef.current = true;
      setProgress(null);
      setResult(null);
      setError(null);
      setIsAnalyzingState(true);
      isAnalyzingRef.current = true;

      try {
        const chess = new Chess();
        chess.loadPgn(pgn);
        const histVerbose = chess.history({ verbose: true }) as Array<Move>;
        const uciMoves = histVerbose.map(
          (m) => `${m.from}${m.to}${m.promotion ? m.promotion : ''}`
        );
        const whitePlayer = (chess.header().White as string) || 'White';
        const blackPlayer = (chess.header().Black as string) || 'Black';

        setProgress({
          type: 'start',
          totalMoves: uciMoves.length,
          white: whitePlayer,
          black: blackPlayer,
        });

        let openingsDatabase: Record<string, string> = {};
        try {
          openingsDatabase = await loadOpeningsDatabase();
        } catch (err) {
          console.warn('[analysis] ❌ failed to load openings database:', err);
        }

        let lastTheoryMoveIndex = -1;
        let openingName: string | undefined = undefined;
        try {
          const theoryChess = new Chess();
          for (let i = 0; i < histVerbose.length; i++) {
            theoryChess.move(histVerbose[i]);
            const normalizedFenAfter = normalizeFen(theoryChess.fen());
            if (openingsDatabase[normalizedFenAfter]) {
              lastTheoryMoveIndex = i;
              openingName = openingsDatabase[normalizedFenAfter];
            } else {
              break;
            }
          }
        } catch (err) {
          console.warn('[analysis] error during theory scan:', err);
        }

        const enginePath =
          stockfishVersion === 'lite'
            ? '/stockfish/stockfish-17.1-lite-single.js'
            : '/stockfish/stockfish-17.1-single.js';
        const engine = new Worker(enginePath);
        engineRef.current = engine;

        engine.onmessage = () => {
        };

        engine.postMessage('uci');
        engine.postMessage('isready');

        const evaluatePosition = (
          fen: string,
          depth = stockfishDepth,
          multipv = 1,
          timeoutMs = 10000
        ) => {
          return new Promise<
            Array<{ cp: number | null; mate: number | null; bestmove?: string | null }>
          >((resolve) => {
            const results: Array<{
              cp: number | null;
              mate: number | null;
              bestmove?: string | null;
            }> = [];
            const onMessage = (e: MessageEvent) => {
              const line = typeof e.data === 'string' ? e.data : (e.data && e.data.data) || '';
              if (!line) return;
              if (line.startsWith('info') && line.includes('multipv')) {
                const parsed = parseUciScore(line);
                if (parsed) {
                  const pvIndex = parseInt(line.split('multipv ')[1]) - 1;
                  const moveUci = line.split(' pv ')[1]?.split(' ')[0] || null;
                  results[pvIndex] = {
                    cp: parsed.cp ?? null,
                    mate: parsed.mate ?? null,
                    bestmove: moveUci,
                  };
                }
              }
              if (line.startsWith('bestmove')) {
                engine.removeEventListener('message', onMessage);
                clearTimeout(to);
                resolve(results);
              }
            };

            engine.addEventListener('message', onMessage);

            const posCmd = `position fen ${fen}`;
            try {
              engine.postMessage('setoption name MultiPV value ' + multipv);
              engine.postMessage(posCmd);
              engine.postMessage(`go depth ${depth}`);
            } catch {
              engine.removeEventListener('message', onMessage);
              resolve([]);
            }

            const to = setTimeout(() => {
              engine.removeEventListener('message', onMessage);
              resolve(results);
            }, timeoutMs);
          });
        };

        const whiteMoves: MoveAnalysis[] = [];
        const blackMoves: MoveAnalysis[] = [];
        let previousEvaluation: Evaluation | null = null;
        const gameChess = new Chess();

        for (let i = 0; i < histVerbose.length; i++) {
          if (!isAnalyzingRef.current) break;

          const playedMove = histVerbose[i];
          const sideToMoveBefore = playedMove.color === 'w' ? 'white' : 'black';
          const fenBefore = gameChess.fen();

          const beforeEvals = await evaluatePosition(fenBefore, stockfishDepth, 2);
          const beforeEval = beforeEvals[0] || { cp: 0, mate: null, bestmove: null };
          const secondBestBeforeEval = beforeEvals[1] || null;

          const beforeEvaluation: Evaluation =
            beforeEval.mate !== null
              ? {
                  type: 'mate',
                  value: sideToMoveBefore === 'white' ? beforeEval.mate : -beforeEval.mate,
                }
              : {
                  type: 'centipawn',
                  value:
                    sideToMoveBefore === 'white' ? (beforeEval.cp ?? 0) : -(beforeEval.cp ?? 0),
                };

          const secondBestBeforeEvaluation: Evaluation | null = secondBestBeforeEval
            ? secondBestBeforeEval.mate !== null
              ? {
                  type: 'mate',
                  value:
                    sideToMoveBefore === 'white'
                      ? secondBestBeforeEval.mate
                      : -secondBestBeforeEval.mate,
                }
              : {
                  type: 'centipawn',
                  value:
                    sideToMoveBefore === 'white'
                      ? (secondBestBeforeEval.cp ?? 0)
                      : -(secondBestBeforeEval.cp ?? 0),
                }
            : null;

          if (i === 0) {
            previousEvaluation = beforeEvaluation;
          }

          gameChess.move(playedMove);
          const fenAfter = gameChess.fen();
          const sideToMoveAfter = playedMove.color === 'w' ? 'black' : 'white';

          const afterEvals = await evaluatePosition(fenAfter, stockfishDepth, 1);
          const afterEval = afterEvals[0] || { cp: 0, mate: null, bestmove: null };

          const currentEvaluation: Evaluation =
            afterEval.mate !== null
              ? {
                  type: 'mate',
                  value: sideToMoveAfter === 'white' ? afterEval.mate : -afterEval.mate,
                }
              : {
                  type: 'centipawn',
                  value: sideToMoveAfter === 'white' ? (afterEval.cp ?? 0) : -(afterEval.cp ?? 0),
                };

          const subjectiveEvaluation: Evaluation =
            currentEvaluation.type === 'mate'
              ? {
                  type: 'mate',
                  value:
                    playedMove.color === 'w' ? currentEvaluation.value : -currentEvaluation.value,
                }
              : {
                  type: 'centipawn',
                  value:
                    playedMove.color === 'w' ? currentEvaluation.value : -currentEvaluation.value,
                };

          const secondSubjectiveEvaluation: Evaluation | undefined = secondBestBeforeEvaluation
            ? secondBestBeforeEvaluation.type === 'mate'
              ? {
                  type: 'mate',
                  value:
                    playedMove.color === 'w'
                      ? secondBestBeforeEvaluation.value
                      : -secondBestBeforeEvaluation.value,
                }
              : {
                  type: 'centipawn',
                  value:
                    playedMove.color === 'w'
                      ? secondBestBeforeEvaluation.value
                      : -secondBestBeforeEvaluation.value,
                }
            : undefined;

          let classification: Classification;

          if (i <= lastTheoryMoveIndex) {
            classification = Classification.THEORY;
          } else if (gameChess.isCheckmate()) {
            classification = Classification.BEST;
          } else {
            const boardBefore = new Chess(fenBefore);
            const bestMove = beforeEval.bestmove ? boardBefore.move(beforeEval.bestmove) : null;

            const topMovePlayed = bestMove && playedMove.san === bestMove.san;

            classification = topMovePlayed
              ? Classification.BEST
              : previousEvaluation
                ? classifyMove(previousEvaluation, currentEvaluation, sideToMoveBefore)
                : Classification.BEST;

            if (topMovePlayed) {
              const previous = {
                board: boardBefore,
                evaluation: beforeEvaluation,
                secondSubjectiveEvaluation,
                secondTopLine: secondBestBeforeEvaluation
                  ? { evaluation: secondBestBeforeEvaluation }
                  : undefined,
              };
              const current = {
                board: gameChess,
                playedMove,
                subjectiveEvaluation,
                evaluation: currentEvaluation,
              };

              if (considerCriticalClassification(previous, current)) {
                classification = Classification.CRITICAL;
              }
            }

            if (
              classification === Classification.BEST ||
              classification === Classification.CRITICAL
            ) {
              const previous = {
                board: boardBefore,
                evaluation: beforeEvaluation,
                secondSubjectiveEvaluation,
              };
              const current = {
                board: gameChess,
                playedMove,
                subjectiveEvaluation,
                evaluation: currentEvaluation,
              };

              if (considerBrilliantClassification(previous, current)) {
                classification = Classification.BRILLIANT;
              }
            }
          }

          const moveAnalysis: MoveAnalysis = {
            index: i + 1,
            san: playedMove.san,
            color: sideToMoveBefore,
            classification,
            best_move: beforeEval.bestmove ?? null,
            evaluation: currentEvaluation,
            previous_evaluation: previousEvaluation,
          };

          if (sideToMoveBefore === 'white') whiteMoves.push(moveAnalysis);
          else blackMoves.push(moveAnalysis);

          previousEvaluation = currentEvaluation;

          const prog = Math.round(((i + 1) / histVerbose.length) * 100);
          setProgress({ type: 'progress', moveIndex: i + 1, progress: prog, movesAnalyzed: i + 1 });
        }

        const assembled: AnalysisResult = {
          white: { player: whitePlayer, stats: calculateStats(whiteMoves), moves: whiteMoves },
          black: { player: blackPlayer, stats: calculateStats(blackMoves), moves: blackMoves },
          openingName,
        };

        setResult(assembled);
        setProgress({ type: 'complete' });
        setIsAnalyzingState(false);
        isAnalyzingRef.current = false;
        hasStartedRef.current = false;
        try {
          engine.terminate?.();
          engineRef.current = null;
        } catch {}
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Analysis error';
        setError(errorMsg);
        setProgress({ type: 'error', error: errorMsg });
        setIsAnalyzingState(false);
        isAnalyzingRef.current = false;
        hasStartedRef.current = false;
      }
    },
    [stockfishVersion, stockfishDepth]
  );

  const stopAnalysis = useCallback(() => {
    try {
      if (engineRef.current) {
        engineRef.current.terminate?.();
        engineRef.current = null;
      }
    } catch {}
    setIsAnalyzingState(false);
    isAnalyzingRef.current = false;
    hasStartedRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      try {
        if (engineRef.current) {
          engineRef.current.terminate?.();
          engineRef.current = null;
        }
      } catch {}
    };
  }, []);

  return {
    progress,
    result,
    isAnalyzing,
    error,
    startAnalysis,
    stopAnalysis,
  };
}

export * from './types';
