import { useEffect, useMemo, useState, useRef, lazy, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { withLang } from '../../i18n';
import { MdOutlineLoop } from 'react-icons/md';
import { BiSearch } from 'react-icons/bi';
import { Chess } from 'chess.js';
import { Layout } from '../../components/Layout';
import { SEO } from '../../components/SEO';
import { BoardSection } from '../../components/BoardSection';
const MovesPanel = lazy(() =>
  import('../../components/MovesPanel').then((m) => ({ default: m.MovesPanel }))
);
import { EvaluationBar } from '../../components/EvaluationBar';
import { useGameData } from '../../hooks/useGameData';
import { usePlayerAvatars } from '../../hooks/usePlayerAvatars';
import { useAnalysis } from '../../hooks/useAnalysis';
const StockfishSettingsModal = lazy(() =>
  import('../../components/StockfishSettingsModal').then((m) => ({
    default: m.StockfishSettingsModal,
  }))
);
import { useChessStore } from '../../store';
import { Evaluation, Classification } from '../../types/evaluation';
import { playBoardSound } from '../../lib/boardSounds';
import type { NavState } from './types';
import { AdSense } from '../../components/AdSense';

export default function AnalyzePage() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const rawState = (location.state || {}) as NavState;
  const params = new URLSearchParams(location.search);
  const pgnFromQuery = params.get('pgn') || undefined;
  const usernameFromQuery = params.get('username') || undefined;
  const analyzeFromQuery = params.get('analyze') === '1' || params.get('analyze') === 'true';
  let whiteFromQuery: NavState['white'] | undefined = undefined;
  let blackFromQuery: NavState['black'] | undefined = undefined;
  try {
    const w = params.get('white');
    if (w) whiteFromQuery = JSON.parse(decodeURIComponent(w));
  } catch { }
  try {
    const b = params.get('black');
    if (b) blackFromQuery = JSON.parse(decodeURIComponent(b));
  } catch { }

  const state = {
    ...rawState,
    pgn: rawState.pgn || pgnFromQuery,
    username: rawState.username || usernameFromQuery,
    analyze: rawState.analyze || analyzeFromQuery,
    white: rawState.white || whiteFromQuery,
    black: rawState.black || blackFromQuery,
  } as NavState;
  const { currentGame, setCurrentGame } = useChessStore();

  const username = state.username || currentGame?.username;

  const [manualPgn] = useState<string | null>(state.pgn || currentGame?.pgn || null);

  const [isAnalyzing, setIsAnalyzing] = useState(() => {
    if (state.analyze) return true;
    const pgn = state.pgn || currentGame?.pgn;
    if (currentGame?.analysis && currentGame?.pgn === pgn) return true;
    return false;
  });

  useEffect(() => {
    if (!manualPgn && !currentGame?.pgn) {
      navigate(withLang('/game'), { replace: true });
    }
  }, [manualPgn, currentGame, navigate, i18n.language]);

  const gameData = useGameData(t, manualPgn);
  const {
    pgn,
    error,
    loading,
    moves,
    headers,
    chessAt,
    lastMoveSquares,
    lastMoveSquareInfo,
    index,
    setIndex,
    resultMessage,
  } = gameData;

  useEffect(() => {
    if (pgn && !error) {
      const isDifferentPgn = !currentGame || currentGame.pgn !== pgn;
      if (isDifferentPgn) {
        const isNewPGN = currentGame?.pgn && currentGame.pgn !== pgn;

        setCurrentGame({
          pgn,
          username,
          analyze: false,
          white: state.white || currentGame?.white,
          black: state.black || currentGame?.black,
          analysis: isNewPGN ? undefined : currentGame?.analysis,
        });
      }
    }
  }, [
    pgn,
    error,
    username,
    state.white,
    state.black,
    currentGame?.white,
    currentGame?.black,
    currentGame?.pgn,
    currentGame?.analysis,
    setCurrentGame,
  ]);

  useEffect(() => {
    if (error && manualPgn) {
      navigate(withLang('/game'), { state: { pgn: manualPgn, error }, replace: true });
    }
  }, [error, manualPgn, navigate, i18n.language]);

  const effectiveMoves = moves;
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { whiteMeta, blackMeta } = usePlayerAvatars({
    stateWhite: state.white || currentGame?.white,
    stateBlack: state.black || currentGame?.black,
    headerWhite: (headers as Record<string, string>)['White'],
    headerBlack: (headers as Record<string, string>)['Black'],
    headerWhiteElo: (headers as Record<string, string>)['WhiteElo'],
    headerBlackElo: (headers as Record<string, string>)['BlackElo'],
  });

  const {
    progress,
    result: analysisResult,
    isAnalyzing: wsIsAnalyzing,
    error: analysisError,
    startAnalysis,
  } = useAnalysis();

  const hasCachedAnalysis = currentGame?.analysis && currentGame?.pgn === pgn;

  const result = hasCachedAnalysis ? currentGame.analysis : analysisResult;

  const analysisStartedRef = useRef(false);

  useEffect(() => {
    if (analysisResult && pgn && !analysisError) {
      const alreadyHasAnalysis =
        currentGame?.analysis &&
        JSON.stringify(currentGame.analysis) === JSON.stringify(analysisResult);
      if (!alreadyHasAnalysis) {
        setCurrentGame({
          pgn,
          username,
          analyze: false,
          white: state.white || currentGame?.white,
          black: state.black || currentGame?.black,
          analysis: analysisResult,
        });
      }
    }
  }, [
    analysisResult,
    pgn,
    analysisError,
    username,
    state.white,
    state.black,
    currentGame?.white,
    currentGame?.black,
    setCurrentGame,
  ]);

  useEffect(() => {
    if (hasCachedAnalysis) {
      analysisStartedRef.current = true;
      return;
    }

    if (isAnalyzing && pgn && !wsIsAnalyzing && !analysisStartedRef.current) {
      const timer = setTimeout(() => {
        if (!analysisStartedRef.current) {
          analysisStartedRef.current = true;
          startAnalysis(pgn, 'both');
        }
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, pgn, wsIsAnalyzing, startAnalysis, hasCachedAnalysis]);

  useEffect(() => {
    if (!username) return;

    const headersRecord = headers as Record<string, string>;
    const headerWhite = headersRecord['White'];
    const headerBlack = headersRecord['Black'];

    if (headerWhite && headerBlack) {
      const u = username.toLowerCase();
      if (headerWhite.toLowerCase() === u) {
        setOrientation('white');
        return;
      }
      if (headerBlack.toLowerCase() === u) {
        setOrientation('black');
        return;
      }
    }

    const stateWhite = state.white || currentGame?.white;
    const stateBlack = state.black || currentGame?.black;

    if (stateWhite?.username?.toLowerCase() === username.toLowerCase()) {
      setOrientation('white');
    } else if (stateBlack?.username?.toLowerCase() === username.toLowerCase()) {
      setOrientation('black');
    }
  }, [username, headers, state.white, state.black, currentGame]);

  const headersDate = (headers as Record<string, string>)['Date'];

  const date = useMemo(() => {
    const d = headersDate;
    if (!d) return undefined;
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime()))
      return parsed.toLocaleString(i18n.language === 'en' ? 'en-US' : 'fr-FR');
    return d;
  }, [headersDate, i18n.language]);

  const [boardHeight, setBoardHeight] = useState(0);

  useEffect(() => {
    const { soundsEnabled } = useChessStore.getState();
    if (!soundsEnabled || !effectiveMoves || index <= 0) return;

    const moveIndexZeroBased = index - 1;
    if (moveIndexZeroBased >= effectiveMoves.length) return;

    const moveSan = effectiveMoves[moveIndexZeroBased];
    if (!moveSan) return;

    const boardBefore = new Chess();
    for (let i = 0; i < moveIndexZeroBased; i++) {
      boardBefore.move(effectiveMoves[i]);
    }
    const fenBefore = boardBefore.fen();

    const move = boardBefore.move(moveSan);
    if (!move) return;

    try {
      playBoardSound(move, fenBefore);
    } catch {
    }
  }, [index, effectiveMoves]);

  const currentMoveClassification = useMemo((): Classification | null => {
    if (!result || index <= 0) return null;
    const moveIndexZeroBased = index - 1;
    const movingColor = moveIndexZeroBased % 2 === 0 ? 'white' : 'black';
    const playerMoves = movingColor === 'white' ? result.white.moves : result.black.moves;
    const playerMoveIndex = Math.floor(moveIndexZeroBased / 2);
    const moveData = playerMoves[playerMoveIndex];
    if (!moveData) return null;
    return moveData.classification;
  }, [result, index]);

  const currentMoveEvaluation = useMemo((): Evaluation | null => {
    if (!result || index <= 0) return null;
    const moveIndexZeroBased = index - 1;
    const movingColor = moveIndexZeroBased % 2 === 0 ? 'white' : 'black';
    const playerMoves = movingColor === 'white' ? result.white.moves : result.black.moves;
    const playerMoveIndex = Math.floor(moveIndexZeroBased / 2);
    const moveData = playerMoves[playerMoveIndex];
    if (!moveData) return null;
    return moveData.evaluation;
  }, [result, index]);

  const currentMoveIsCheckmate = useMemo(() => {
    if (!result || index <= 0) return false;
    const moveIndexZeroBased = index - 1;
    const movingColor = moveIndexZeroBased % 2 === 0 ? 'white' : 'black';
    const playerMoves = movingColor === 'white' ? result.white.moves : result.black.moves;
    const playerMoveIndex = Math.floor(moveIndexZeroBased / 2);
    const moveData = playerMoves[playerMoveIndex];
    return moveData?.san?.endsWith('#') || false;
  }, [result, index]);

  const bestMoveSquares = useMemo(() => {
    if (!result || index <= 0) return null;
    const moveIndexZeroBased = index - 1;
    const movingColor = moveIndexZeroBased % 2 === 0 ? 'white' : 'black';
    const playerMoves = movingColor === 'white' ? result.white.moves : result.black.moves;
    const playerMoveIndex = Math.floor(moveIndexZeroBased / 2);
    const moveData = playerMoves[playerMoveIndex];
    if (!moveData || !moveData.best_move) return null;

    const uci = moveData.best_move;
    if (uci.length < 4) return null;

    return {
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
    };
  }, [result, index]);

  const checkmateResult = useMemo(() => {
    if (!currentMoveIsCheckmate || index <= 0) return null;
    const moveIndexZeroBased = index - 1;
    const movingColor = moveIndexZeroBased % 2 === 0 ? 'white' : 'black';
    return movingColor === 'white' ? '1-0' : '0-1';
  }, [currentMoveIsCheckmate, index]);

  if (!pgn || loading) {
    return (
      <Layout>
        <main className="mx-auto max-w-7xl lg:max-w-screen-2xl px-4 sm:px-6 lg:px-6 xl:px-4 2xl:px-8 py-4 sm:py-6 lg:py-6 xl:py-4 2xl:py-6">
          <div className="text-center text-gray-400">{t('loading', 'Chargement...')}</div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={t('analysis.title')}
        description={t('seo.analyze.description')}
      />
      <main className="w-full px-0 sm:px-0 lg:px-6 xl:px-2 2xl:px-4 py-0 sm:py-0 lg:py-6 xl:py-2 2xl:py-4 min-h-[calc(100vh-64px)] flex flex-col">
        <section className="flex-1 flex flex-col lg:block space-y-0 sm:space-y-0">
          <div className="flex flex-col lg:flex-row gap-0 sm:gap-0 lg:gap-2 xl:gap-4 2xl:gap-6 items-center lg:items-start justify-start lg:justify-center h-auto flex-1">
            <div className="flex gap-0 sm:gap-0 lg:gap-2 xl:gap-4 2xl:gap-6 items-center lg:items-stretch w-auto order-2 lg:order-1">
              <div className="hidden lg:block w-8 sm:w-10 lg:w-12 xl:w-10 2xl:w-12 border-gray-300 overflow-hidden">
                <EvaluationBar
                  evaluation={currentMoveEvaluation}
                  orientation={orientation}
                  finalResult={checkmateResult || resultMessage}
                />
              </div>

              <div className="flex flex-col gap-0 sm:gap-0 lg:gap-2 xl:gap-1 2xl:gap-2 h-auto w-auto min-w-0 items-center lg:items-start">
                <BoardSection
                  orientation={orientation}
                  chessFen={chessAt.fen()}
                  lastMoveSquares={lastMoveSquares}
                  lastMoveSquareInfo={lastMoveSquareInfo}
                  currentMoveClassification={currentMoveClassification}
                  bestMoveSquares={bestMoveSquares}
                  topPlayer={orientation === 'white' ? blackMeta : whiteMeta}
                  bottomPlayer={orientation === 'white' ? whiteMeta : blackMeta}
                  topPlayerStats={
                    orientation === 'white' ? result?.black.stats : result?.white.stats
                  }
                  bottomPlayerStats={
                    orientation === 'white' ? result?.white.stats : result?.black.stats
                  }
                  onHeightChange={setBoardHeight}
                />
                {/* Progress bar for mobile: show under board when analyzing */}
                {isAnalyzing && wsIsAnalyzing && (
                  <div className="w-full mt-2 space-y-0.5 block sm:hidden">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-gray-400">
                        {t('analysis.progress', 'Analyse')}: {Math.round(progress?.progress || 0)}%
                      </span>
                    </div>
                    <div className="w-full h-0.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress?.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-row lg:flex-col items-center justify-center w-full lg:w-auto px-4 my-4 lg:my-0 gap-4 sm:gap-1.5 lg:gap-1 xl:gap-0.5 2xl:gap-1 flex-shrink-0 h-auto order-1 lg:order-2">
              <div className="flex gap-4 lg:flex-col lg:gap-1">
                <button
                  onClick={() => setOrientation((o) => (o === 'white' ? 'black' : 'white'))}
                  className="w-12 h-12 sm:w-8 sm:h-8 lg:w-7 lg:h-7 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 flex items-center justify-center bg-white/15 hover:bg-white/25 border border-white/30 hover:border-white/50 rounded-xl sm:rounded transition-all shadow-lg sm:shadow-none"
                  title={t('game.flipBoard', 'Retourner le plateau')}
                >
                  <MdOutlineLoop className="w-6 h-6 sm:w-4 sm:h-4 lg:w-3.5 lg:h-3.5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 text-gray-200 hover:text-white rotate-90" />
                </button>

                {pgn && !isAnalyzing && (
                  <button
                    onClick={() => setIsAnalyzing(true)}
                    className="w-12 h-12 sm:w-8 sm:h-8 lg:w-7 lg:h-7 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 flex items-center justify-center bg-white/15 hover:bg-white/25 border border-white/30 hover:border-white/50 rounded-xl sm:rounded transition-all shadow-lg sm:shadow-none"
                    title={t('game.analyzeGame', 'Analyser cette partie')}
                  >
                    <BiSearch className="w-6 h-6 sm:w-4 sm:h-4 lg:w-3.5 lg:h-3.5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 text-gray-200 hover:text-white" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-1 sm:gap-1.5 lg:gap-3 xl:gap-4 2xl:gap-6 w-full lg:w-auto h-auto min-w-0 lg:items-start mt-4 lg:mt-0 order-3 lg:order-3 flex-1 lg:flex-none bg-slate-900/30 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-t lg:border-t-0 border-white/10 pt-4 lg:pt-0 pb-8 lg:pb-0 px-4 lg:px-0 rounded-t-3xl lg:rounded-none shadow-[0_-4px_20px_rgba(0,0,0,0.3)] lg:shadow-none z-10">
              <div className="w-full sm:w-96 lg:w-96 xl:w-80 2xl:w-96 flex-shrink-0 flex flex-col overflow-hidden h-auto">
                <Suspense
                  fallback={
                    <div className="text-xs sm:text-sm text-gray-400">
                      {t('loading', 'Chargement...')}
                    </div>
                  }
                >
                  <MovesPanel
                    moves={effectiveMoves}
                    index={index}
                    setIndex={setIndex}
                    loading={loading}
                    error={error}
                    pgn={pgn}
                    date={date}
                    result={resultMessage}
                    openingName={result?.openingName}
                    height={boardHeight}
                    labels={{
                      moves: t('game.moves', 'Coups'),
                      loading: t('loading', 'Chargement...'),
                      noMoves: t('game.noMoves', 'Aucun coup parsé'),
                      noPGN: t('game.noPGN', 'Aucune partie'),
                    }}
                    analysisData={
                      result
                        ? {
                          whiteMoves: result.white.moves,
                          blackMoves: result.black.moves,
                        }
                        : null
                    }
                    onSettingsClick={() => setIsSettingsOpen(true)}
                  />
                </Suspense>

                {isAnalyzing && wsIsAnalyzing && (
                  <div className="w-full mt-0.5 sm:mt-1 lg:mt-0.5 xl:mt-0 2xl:mt-0.5 space-y-0.5 hidden sm:block">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-gray-400">
                        {t('analysis.progress', 'Analyse')}: {Math.round(progress?.progress || 0)}%
                      </span>
                    </div>
                    <div className="w-full h-0.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress?.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              {/* Wide skyscraper (160x600) visible on xl+ only */}
              <div className="hidden xl:flex flex-col flex-shrink-0 ml-4" style={{ width: 160 }}>
                <div className="sticky top-20">
                  <AdSense
                    key={`mob-${pgn?.substring(0, 20)}`}
                    client="ca-pub-3159144477736312"
                    slot="3663625441"
                    style={{ width: 160, height: 600 }}
                    format={null}
                  />
                </div>
              </div>
            </div>
          </div>
          <Suspense fallback={null}>
            <StockfishSettingsModal
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
            />
          </Suspense>
        </section>
      </main>
    </Layout>
  );
}
