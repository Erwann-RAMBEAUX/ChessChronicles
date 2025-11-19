import { useEffect, useRef, useState, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square, Arrow } from 'react-chessboard/dist/chessboard/types';
import { PlayerBar } from '../PlayerBar';
import type { BoardSectionProps } from './types';
import { buildCustomSquareStyles, calculateBadgePosition } from './utils';
import { Classification } from '../../types/evaluation';

export const BoardSection = ({
  orientation,
  chessFen,
  lastMoveSquares,
  lastMoveSquareInfo,
  currentMoveClassification,
  bestMoveSquares,
  topPlayer,
  bottomPlayer,
  topPlayerStats,
  bottomPlayerStats,
  onHeightChange,
}: BoardSectionProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState(0);

  const shouldShowBestMove = useMemo(() => {
    if (!currentMoveClassification) return false;
    const badClassifications = [
      Classification.INACCURACY,
      Classification.MISTAKE,
      Classification.BLUNDER,
    ];
    return badClassifications.includes(currentMoveClassification);
  }, [currentMoveClassification]);

  const customSquareStyles = useMemo(
    () => buildCustomSquareStyles(lastMoveSquares, currentMoveClassification || null),
    [lastMoveSquares, currentMoveClassification]
  );

  const badgePosition = useMemo(
    () => calculateBadgePosition(lastMoveSquareInfo?.to, size, orientation),
    [lastMoveSquareInfo?.to, size, orientation]
  );

  const bestMoveArrowPosition = useMemo((): Arrow | null => {
    if (!shouldShowBestMove || !bestMoveSquares?.from || !bestMoveSquares?.to) return null;
    return [bestMoveSquares.from as Square, bestMoveSquares.to as Square, 'rgba(255, 200, 0, 1)'];
  }, [shouldShowBestMove, bestMoveSquares]);

  useEffect(() => {
    function compute() {
      if (!boardRef.current) return;
      const maxWidth = window.innerWidth * 0.95;
      const maxHeight = window.innerHeight * 0.85 - 200;
      const maxLimit =
        window.innerWidth >= 1280
          ? 1000
          : window.innerWidth >= 768
            ? 700
            : window.innerWidth >= 640
              ? 560
              : Math.floor(window.innerWidth * 0.9);

      const availableSize = Math.min(maxWidth, maxHeight, maxLimit);
      setSize(Math.floor(availableSize));
    }
    compute();
    const ro = new ResizeObserver(compute);
    if (boardRef.current) ro.observe(boardRef.current);
    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, []);

  useEffect(() => {
    if (ref.current && onHeightChange) {
      const rect = ref.current.getBoundingClientRect();
      onHeightChange(rect.height);
    }
  }, [size, onHeightChange]);

  return (
    <div ref={ref} className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 space-y-3 w-full sm:w-fit mx-auto shadow-lg">
      <div className="flex flex-col items-center sm:items-start gap-3 w-full">
        <div className="flex items-center gap-3 w-full">
          <PlayerBar player={topPlayer} stats={topPlayerStats} position="top" />
        </div>
        <div ref={boardRef} className="flex justify-center relative">
          <Chessboard
            position={chessFen}
            arePiecesDraggable={false}
            boardWidth={size || 300}
            boardOrientation={orientation}
            customSquareStyles={
              customSquareStyles as Record<string, Record<string, string | number>>
            }
            customArrows={bestMoveArrowPosition ? [bestMoveArrowPosition] : []}
          />

          {currentMoveClassification && badgePosition && (
            <img
              src={`/img/classification/${String(currentMoveClassification).toLowerCase()}.png`}
              alt={String(currentMoveClassification)}
              className="absolute pointer-events-none"
              style={{
                width: `${Math.ceil(badgePosition.squareSize * 0.35)}px`,
                height: `${Math.ceil(badgePosition.squareSize * 0.35)}px`,
                left: `${Math.ceil(badgePosition.x + badgePosition.squareSize - badgePosition.squareSize * 0.35 - 2)}px`,
                top: `${Math.ceil(badgePosition.y + 2)}px`,
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-3 w-full">
          <PlayerBar player={bottomPlayer} stats={bottomPlayerStats} position="bottom" />
        </div>
      </div>
    </div>
  );
};
