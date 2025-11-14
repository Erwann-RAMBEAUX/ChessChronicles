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
}

/**
 * Barre d'évaluation comme Chess.com
 * Affiche:
 * - Barre visuelle blanc vs noir
 * - Score numérique
 * - Indicateurs d'échec/mat
 * - Prédictions de mat forcé
 */
export function EvaluationBar({
  eval_data,
  position_status,
  mate_info,
}: EvaluationBarProps) {
  if (!eval_data) {
    return (
      <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center">
        <p className="text-gray-400">En attente d'analyse...</p>
      </div>
    );
  }

  const barPercentage = eval_data.bar_percentage;

  return (
    <div className="w-full space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
      {/* Barre d'avantage */}
      <div className="flex items-center space-x-2">
        {/* Étiquette blanc */}
        <span className="text-xs font-bold text-white bg-gray-800 px-2 py-1 rounded">
          ⚪
        </span>

        {/* Barre */}
        <div className="flex-1 h-8 rounded border border-gray-300 overflow-hidden flex bg-white">
          {/* Section blanche */}
          <div
            className="bg-white transition-all duration-300 ease-out"
            style={{ width: `${barPercentage}%` }}
          />
          {/* Section noire */}
          <div
            className="bg-gray-900 transition-all duration-300 ease-out"
            style={{ width: `${100 - barPercentage}%` }}
          />
        </div>

        {/* Étiquette noir */}
        <span className="text-xs font-bold text-white bg-gray-800 px-2 py-1 rounded">
          ⚫
        </span>
      </div>

      {/* Score et indicateurs */}
      <div className="flex items-center justify-between">
        {/* Score principal */}
        <div
          className={`text-lg font-bold px-3 py-1 rounded ${
            eval_data.advantage_color === 'white'
              ? 'bg-gray-800 text-white'
              : 'bg-white text-gray-800 border border-gray-300'
          }`}
        >
          {eval_data.score}
        </div>

        {/* Indicateurs d'état */}
        <div className="flex items-center space-x-2">
          {/* Check */}
          {position_status?.is_check && !position_status?.is_checkmate && (
            <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">
              ♔ CHECK
            </span>
          )}

          {/* Checkmate */}
          {position_status?.is_checkmate && (
            <span className="inline-flex items-center px-2 py-1 rounded bg-red-500 text-white text-xs font-semibold">
              ♔ CHECKMATE
            </span>
          )}

          {/* Stalemate */}
          {position_status?.is_stalemate && (
            <span className="inline-flex items-center px-2 py-1 rounded bg-gray-400 text-white text-xs font-semibold">
              PAT
            </span>
          )}
        </div>
      </div>

      {/* Prédiction de mat */}
      {mate_info?.is_mate_sequence && mate_info?.display_text && (
        <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded">
          <p className="text-center text-sm font-bold text-purple-700">
            🔮 {mate_info.display_text}
          </p>
        </div>
      )}
    </div>
  );
}

export default EvaluationBar;
