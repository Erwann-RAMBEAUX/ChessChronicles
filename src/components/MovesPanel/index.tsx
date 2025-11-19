import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SlArrowLeft,
  SlArrowRight,
  SlControlStart,
  SlControlEnd,
  SlControlPlay,
  SlControlPause,
  SlSettings,
} from 'react-icons/sl';
import { ClassificationBadge } from '../ClassificationBadge';
import { MovesPanelProps, MovePair } from './types';
import { formatGameResult, getPieceSymbol } from './utils';

export const MovesPanel = ({
  moves,
  index,
  setIndex,
  loading,
  error,
  pgn,
  result,
  openingName,
  labels,
  analysisData,
  height,
  onSettingsClick,
}: MovesPanelProps) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getMoveClassification = (moveIndex: number) => {
    if (!analysisData) return null;

    const zeroBasedIndex = moveIndex - 1;
    const isWhiteMove = zeroBasedIndex % 2 === 0;
    const playerMoves = isWhiteMove ? analysisData.whiteMoves : analysisData.blackMoves;
    const playerMoveIndex = Math.floor(zeroBasedIndex / 2);

    return playerMoves[playerMoveIndex]?.classification || null;
  };

  useEffect(() => {
    if (!scrollRef.current) return;

    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        const isAtLeastSm = window.matchMedia('(min-width: 640px)').matches;
        if (!isAtLeastSm) return;
      }
    } catch {
    }

    const activeElement = scrollRef.current.querySelector('[data-active="true"]');
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [index]);

  useEffect(() => {
    if (!isPlaying) {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      return;
    }

    playIntervalRef.current = setInterval(() => {
      setIndex((i) => {
        if (i >= moves.length) {
          setIsPlaying(false);
          return moves.length;
        }
        return i + 1;
      });
    }, 1000);

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
  }, [isPlaying, moves.length, setIndex]);

  const movePairs: MovePair[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1] || null,
    });
  }

  return (
    <div
      className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 space-y-4 flex flex-col shadow-lg"
      style={{ height: height ? `${height}px` : 'auto' }}
    >
      {(result && formatGameResult(result, t)) || openingName ? (
        <div className="pb-4 border-b border-white/10">
          {result && formatGameResult(result, t) && (
            <p className="text-sm font-semibold text-white">{formatGameResult(result, t)}</p>
          )}
          {openingName && (
            <p className="text-xs text-gray-400 mt-2">
              {t('analysis.opening', { defaultValue: 'Opening' })}: {openingName}
            </p>
          )}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{labels.moves}</div>
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="p-1 text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
            title={t('analysis.settings.title', "Réglages de l'analyse")}
          >
            <SlSettings className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-sm text-gray-400">{labels.loading}</div>
      ) : moves.length === 0 ? (
        <div className="text-sm text-gray-400">{pgn ? labels.noMoves : labels.noPGN}</div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="sm:hidden mb-2">
            <div className="flex gap-3 justify-center items-center">
              <button
                onClick={() => setIndex(0)}
                disabled={index === 0 || moves.length === 0}
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 border border-white/20 rounded transition-all"
                title={t('game.firstMove', 'Premier coup')}
              >
                <SlControlStart className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0 || moves.length === 0}
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 border border-white/20 rounded transition-all"
                title={t('game.previousMove', 'Coup précédent')}
              >
                <SlArrowLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={moves.length === 0}
                className="w-10 h-10 flex items-center justify-center bg-primary/20 hover:bg-primary/30 disabled:opacity-40 disabled:hover:bg-primary/20 border border-primary/40 rounded transition-all"
                title={isPlaying ? t('game.pause', 'Pause') : t('game.play', 'Lecture')}
              >
                {isPlaying ? (
                  <SlControlPause className="w-5 h-5 text-primary" />
                ) : (
                  <SlControlPlay className="w-5 h-5 text-primary" />
                )}
              </button>
              <button
                onClick={() => setIndex((i) => Math.min(moves.length, i + 1))}
                disabled={index >= moves.length || moves.length === 0}
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 border border-white/20 rounded transition-all"
                title={t('game.nextMove', 'Coup suivant')}
              >
                <SlArrowRight className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setIndex(moves.length)}
                disabled={index >= moves.length || moves.length === 0}
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 border border-white/20 rounded transition-all"
                title={t('game.lastMove', 'Dernier coup')}
              >
                <SlControlEnd className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          <table
            className="w-full text-sm sm:text-base border-collapse flex-shrink-0"
            style={{ tableLayout: 'fixed' }}
          >
            <colgroup>
              <col style={{ width: '32px' }} />
              <col style={{ width: '50%' }} />
              <col style={{ width: '50%' }} />
            </colgroup>
            <thead className="bg-slate-700/30 border-b border-slate-600/30">
              <tr>
                <th className="text-left px-2 py-2.5 sm:py-2.5 text-gray-400 font-medium text-xs sm:text-sm overflow-hidden">
                  #
                </th>
                <th className="text-center px-2 py-2.5 sm:py-2.5 text-gray-400 font-medium text-xs sm:text-sm overflow-hidden">
                  White
                </th>
                <th className="text-center px-2 py-2.5 sm:py-2.5 text-gray-400 font-medium text-xs sm:text-sm overflow-hidden">
                  Black
                </th>
              </tr>
            </thead>
          </table>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
          >
            <table
              className="w-full text-sm sm:text-base border-collapse"
              style={{ tableLayout: 'fixed' }}
            >
              <colgroup>
                <col style={{ width: '32px' }} />
                <col style={{ width: '50%' }} />
                <col style={{ width: '50%' }} />
              </colgroup>
              <tbody className="divide-y divide-slate-600/30">
                {movePairs.map((pair) => {
                  const whiteIndex = (pair.number - 1) * 2 + 1;
                  const blackIndex = pair.number * 2;

                  return (
                    <tr key={pair.number} className="hover:bg-white/5 transition-colors">
                      <td className="px-2 py-3 sm:py-2 text-gray-500 font-mono text-sm overflow-hidden">
                        {pair.number}.
                      </td>
                      <td className="px-2 py-1 sm:py-2 overflow-hidden">
                        <button
                          onClick={() => setIndex(whiteIndex)}
                          data-active={index === whiteIndex}
                          className={`w-full text-left px-3 py-2 sm:px-2 sm:py-1.5 rounded-lg sm:rounded font-mono transition-all flex items-center justify-center sm:justify-start gap-2 sm:gap-0 lg:gap-1 xl:gap-0.5 2xl:gap-0.5 text-base sm:text-sm ${index === whiteIndex
                            ? 'bg-primary/20 text-white border border-primary/40 font-semibold shadow-sm shadow-primary/10'
                            : `text-slate-300 hover:text-white hover:bg-white/5`
                            }`}
                        >
                          <span className="text-xl leading-none flex-shrink-0 inline w-6 text-center">
                            {getPieceSymbol(pair.white, true)}
                          </span>
                          <span className="flex-1 flex-shrink lg:flex-shrink xl:flex-shrink-0 2xl:flex-shrink-0 min-w-0 truncate mr-1 sm:mr-1 lg:mr-2 xl:mr-0.5 2xl:mr-0.5">
                            {pair.white}
                          </span>
                          {getMoveClassification(whiteIndex) && (
                            <ClassificationBadge
                              classification={getMoveClassification(whiteIndex)!}
                            />
                          )}
                        </button>
                      </td>
                      <td className="px-2 py-1 sm:py-2 overflow-hidden">
                        {pair.black ? (
                          <button
                            onClick={() => setIndex(blackIndex)}
                            data-active={index === blackIndex}
                            className={`w-full text-left px-3 py-2 sm:px-2 sm:py-1.5 rounded-lg sm:rounded font-mono transition-all flex items-center justify-center sm:justify-start gap-2 sm:gap-0 lg:gap-1 xl:gap-0.5 2xl:gap-0.5 text-base sm:text-sm ${index === blackIndex
                              ? 'bg-primary/20 text-white border border-primary/40 font-semibold shadow-sm shadow-primary/10'
                              : `text-slate-300 hover:text-white hover:bg-white/5`
                              }`}
                          >
                            <span className="text-xl leading-none flex-shrink-0 inline w-6 text-center">
                              {getPieceSymbol(pair.black, false)}
                            </span>
                            <span className="flex-1 flex-shrink lg:flex-shrink xl:flex-shrink-0 2xl:flex-shrink-0 min-w-0 truncate mr-1 sm:mr-1 lg:mr-2 xl:mr-0.5 2xl:mr-0.5">
                              {pair.black}
                            </span>
                            {getMoveClassification(blackIndex) && (
                              <ClassificationBadge
                                classification={getMoveClassification(blackIndex)!}
                              />
                            )}
                          </button>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="pt-8 border-t border-white/5 space-y-3">
        <div className="hidden sm:flex gap-3 justify-center items-center">
          <button
            onClick={() => setIndex(0)}
            disabled={index === 0 || moves.length === 0}
            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 border border-white/20 rounded transition-all"
            title={t('game.firstMove', 'Premier coup')}
          >
            <SlControlStart className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0 || moves.length === 0}
            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 border border-white/20 rounded transition-all"
            title={t('game.previousMove', 'Coup précédent')}
          >
            <SlArrowLeft className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={moves.length === 0}
            className="w-10 h-10 flex items-center justify-center bg-primary/20 hover:bg-primary/30 disabled:opacity-40 disabled:hover:bg-primary/20 border border-primary/40 rounded transition-all"
            title={isPlaying ? t('game.pause', 'Pause') : t('game.play', 'Lecture')}
          >
            {isPlaying ? (
              <SlControlPause className="w-5 h-5 text-primary" />
            ) : (
              <SlControlPlay className="w-5 h-5 text-primary" />
            )}
          </button>

          <button
            onClick={() => setIndex((i) => Math.min(moves.length, i + 1))}
            disabled={index >= moves.length || moves.length === 0}
            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 border border-white/20 rounded transition-all"
            title={t('game.nextMove', 'Coup suivant')}
          >
            <SlArrowRight className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={() => setIndex(moves.length)}
            disabled={index >= moves.length || moves.length === 0}
            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 border border-white/20 rounded transition-all"
            title={t('game.lastMove', 'Dernier coup')}
          >
            <SlControlEnd className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {error && <div className="text-red-300 text-sm">{error}</div>}
    </div>
  );
};
