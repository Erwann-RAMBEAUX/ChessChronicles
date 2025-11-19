import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { withLang } from '../../i18n';
import pawnSvg from '../../assets/pawn.svg';
import { ClassificationBadge } from '../ClassificationBadge';
import type { PlayerBarProps } from './types';
import { calculateAccuracy } from './utils';

export const PlayerBar = ({ player, stats, position = 'top' }: PlayerBarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const rating = player.rating;

  const handleClick = () => {
    if (player.username) {
      navigate(withLang(`/player/${encodeURIComponent(player.username)}`));
    }
  };

  const accuracy = stats ? calculateAccuracy(stats) : null;

  const containerClass = `${position === 'bottom' ? 'flex flex-col-reverse' : 'flex flex-col'} sm:flex-row items-center gap-2 sm:gap-3 w-full`;

  return (
    <div className={containerClass}>
      <button
        onClick={handleClick}
        className={`font-semibold flex items-center justify-center sm:justify-start gap-2 sm:gap-3 text-gray-100 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 px-4 sm:px-3 py-1.5 sm:py-2 rounded-full sm:rounded-lg transition-colors w-48 max-w-[90%] sm:max-w-none flex-shrink-0 shadow-lg sm:shadow-none`}
      >
        <img
          src={player.avatar || pawnSvg}
          alt={player.username}
          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover bg-black/30 flex-shrink-0"
          loading="lazy"
        />
        <div className="min-w-0 flex-initial sm:flex-1 text-left">
          <p className="text-xs sm:text-sm text-white truncate">{player.username || 'Player'}</p>
          {typeof rating === 'number' && (
            <p className="text-[10px] sm:text-xs text-primary/80">{rating}</p>
          )}
        </div>
      </button>

      {stats && (
        <div className={`w-full sm:w-auto flex ${position === 'bottom' ? 'flex-col-reverse sm:flex-col' : 'flex-col'} gap-1 text-[11px] sm:text-xs text-gray-300 items-center sm:items-start`}>
          {accuracy !== null && (
            <span className="text-[11px] sm:text-sm">
              {t('analysis.accuracy', 'Précision')}:{' '}
              <span className="text-white font-semibold">{accuracy}%</span>
            </span>
          )}

          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center sm:justify-start max-w-xs mx-auto sm:mx-0">
            {stats.theory > 0 && (
              <div className="flex items-center gap-1" title={`Theory: ${stats.theory}`}>
                <ClassificationBadge
                  classification="theory"
                  showAll
                  className="h-3 w-3 sm:h-4 sm:w-4"
                />
                <span>{stats.theory}</span>
              </div>
            )}
            {stats.brilliant > 0 && (
              <div className="flex items-center gap-1" title={`Brilliant: ${stats.brilliant}`}>
                <ClassificationBadge
                  classification="brilliant"
                  showAll
                  className="h-3 w-3 sm:h-4 sm:w-4"
                />
                <span>{stats.brilliant}</span>
              </div>
            )}
            {stats.critical > 0 && (
              <div className="flex items-center gap-1" title={`Critical: ${stats.critical}`}>
                <ClassificationBadge
                  classification="critical"
                  showAll
                  className="h-3 w-3 sm:h-4 sm:w-4"
                />
                <span>{stats.critical}</span>
              </div>
            )}
            {stats.best > 0 && (
              <div className="flex items-center gap-1" title={`Best: ${stats.best}`}>
                <ClassificationBadge
                  classification="best"
                  showAll
                  className="h-3 w-3 sm:h-4 sm:w-4"
                />
                <span>{stats.best}</span>
              </div>
            )}
            {stats.excellent > 0 && (
              <div className="flex items-center gap-1" title={`Excellent: ${stats.excellent}`}>
                <ClassificationBadge
                  classification="excellent"
                  showAll
                  className="h-3 w-3 sm:h-4 sm:w-4"
                />
                <span>{stats.excellent}</span>
              </div>
            )}
            {stats.inaccuracy > 0 && (
              <div className="flex items-center gap-1" title={`Inaccuracy: ${stats.inaccuracy}`}>
                <ClassificationBadge
                  classification="inaccuracy"
                  showAll
                  className="h-3 w-3 sm:h-4 sm:w-4"
                />
                <span>{stats.inaccuracy}</span>
              </div>
            )}
            {stats.mistake > 0 && (
              <div className="flex items-center gap-1" title={`Mistake: ${stats.mistake}`}>
                <ClassificationBadge
                  classification="mistake"
                  showAll
                  className="h-3 w-3 sm:h-4 sm:w-4"
                />
                <span>{stats.mistake}</span>
              </div>
            )}
            {stats.blunder > 0 && (
              <div className="flex items-center gap-1" title={`Blunder: ${stats.blunder}`}>
                <ClassificationBadge
                  classification="blunder"
                  showAll
                  className="h-3 w-3 sm:h-4 sm:w-4"
                />
                <span>{stats.blunder}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
