import React from 'react';

interface EvaluationData {
  score: string;
  centipions: number;
  advantage_color: 'white' | 'black';
  bar_percentage: number;
  raw_score: number;
}

interface MateInfo {
  is_mate_sequence: boolean;
  mate_in: number | null;
  winning_side: 'white' | 'black' | null;
  display_text: string;
}

interface PositionStatus {
  is_check: boolean;
  is_checkmate: boolean;
  is_stalemate: boolean;
  status: 'check' | 'checkmate' | 'stalemate' | 'normal';
}

interface EvaluationBarProps {
  eval_data?: EvaluationData | null;
  position_status?: PositionStatus | null;
  mate_info?: MateInfo | null;
  orientation?: 'white' | 'black';
  finalResult?: string | null; // e.g., "1-0", "0-1", "1/2-1/2"
}

/**
 * Vertical evaluation bar like Chess.com
 * Displays a vertical bar with:
 * - White vs black percentage
 * - Numeric score at top and bottom
 * - Orients based on board (white at bottom or top)
 */
export function EvaluationBar({
  eval_data,
  position_status,
  mate_info,
  orientation = 'white',
  finalResult,
}: EvaluationBarProps) {
  if (!eval_data) {
    return null;
  }

  // If game is finished, show final result
  if (finalResult && (finalResult === '1-0' || finalResult === '0-1' || finalResult === '1/2-1/2')) {
    return (
      <div className="h-full flex flex-col rounded border border-gray-300 overflow-hidden bg-gray-900">
        {/* White section */}
        <div
          className="bg-white transition-all duration-300 ease-out flex flex-col items-center justify-center"
          style={{ height: finalResult === '1-0' ? '100%' : finalResult === '1/2-1/2' ? '50%' : '0%', minHeight: '2px' }}
        >
          {(finalResult === '1-0' || finalResult === '1/2-1/2') && (
            <span className="text-xs font-bold text-gray-800">
              {finalResult === '1-0' ? '1-0' : '½'}
            </span>
          )}
        </div>

        {/* Black section */}
        <div
          className="bg-gray-900 transition-all duration-300 ease-out flex flex-col items-center justify-center"
          style={{ height: finalResult === '0-1' ? '100%' : finalResult === '1/2-1/2' ? '50%' : '0%', minHeight: '2px' }}
        >
          {(finalResult === '0-1' || finalResult === '1/2-1/2') && (
            <span className="text-xs font-bold text-white">
              {finalResult === '0-1' ? '0-1' : '½'}
            </span>
          )}
        </div>
      </div>
    );
  }

  // bar_percentage from backend: 50 = equal, 0-50 = black advantage, 50-100 = white advantage
  // This is ALWAYS from white's perspective
  const backendBarPercentage = eval_data.bar_percentage;
  
  // Determine who is winning and format the score appropriately
  const isWhiteWinning = eval_data.raw_score > 0.1;
  const isBlackWinning = eval_data.raw_score < -0.1;
  const isEqual = Math.abs(eval_data.raw_score) <= 0.1;
  const scoreDisplay = Math.abs(eval_data.raw_score).toFixed(1);

  // Check for mate sequence
  const isMateSequence = mate_info?.is_mate_sequence;
  const mateDisplay = isMateSequence ? `M${mate_info?.mate_in}` : null;
  const displayText = mateDisplay || scoreDisplay;

  // When orientation is 'white': white at BOTTOM, black at TOP
  // When orientation is 'black': black at BOTTOM, white at TOP
  // backendBarPercentage is always white's percentage
  const whiteBottomPercent = backendBarPercentage;
  const blackTopPercent = 100 - whiteBottomPercent;

  return (
    <div className="h-full flex flex-col rounded border border-gray-300 overflow-hidden bg-gray-900">
      {/* Top section */}
      <div
        className={`${orientation === 'white' ? 'bg-gray-900' : 'bg-white'} transition-all duration-300 ease-out flex flex-col items-center justify-start pt-1`}
        style={{ height: `${orientation === 'white' ? blackTopPercent : whiteBottomPercent}%`, minHeight: '2px' }}
      >
        {/* Show score in top section if appropriate */}
        {orientation === 'white' && (
          isBlackWinning || isEqual) && blackTopPercent > 12 && (
          <span className="text-xs font-bold text-white">
            {displayText}
          </span>
        )}
        {orientation === 'black' && (
          isWhiteWinning || isEqual) && whiteBottomPercent > 12 && (
          <span className="text-xs font-bold text-gray-800">
            {displayText}
          </span>
        )}
      </div>

      {/* Bottom section */}
      <div
        className={`${orientation === 'white' ? 'bg-white' : 'bg-gray-900'} transition-all duration-300 ease-out flex flex-col items-center justify-end pb-1`}
        style={{ height: `${orientation === 'white' ? whiteBottomPercent : blackTopPercent}%`, minHeight: '2px' }}
      >
        {/* Show score in bottom section if appropriate */}
        {orientation === 'white' && (
          isWhiteWinning || isEqual) && whiteBottomPercent > 12 && (
          <span className="text-xs font-bold text-gray-800">
            {displayText}
          </span>
        )}
        {orientation === 'black' && (
          isBlackWinning || isEqual) && blackTopPercent > 12 && (
          <span className="text-xs font-bold text-white">
            {displayText}
          </span>
        )}
      </div>
    </div>
  );
}

export default EvaluationBar;
