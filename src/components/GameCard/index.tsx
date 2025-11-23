import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { withLang } from '../../i18n';
import type { GameCardProps } from './types';
import { formatGameDate, formatGameTime, getResultBgClass, getPieceSymbol } from './utils';

export function GameCard({ game }: GameCardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const date = formatGameDate(game, i18n.language);
  const time = formatGameTime(game, i18n.language);
  const myRating = game[game.userColor].rating;

  return (
    <div className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 flex flex-col gap-3 hover:border-primary/30 transition-colors group">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {t('home.list.card.date')}: {date}
        </div>
        <div className="text-xs text-gray-400">
          {t('home.list.card.time')}: {time}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-5xl">{getPieceSymbol(game.userColor)}</div>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate(withLang(`/player/${game.opponent.username}`))}
            className="block w-full text-left font-medium truncate text-white hover:text-gray-300 hover:underline transition-colors"
          >
            {game.opponent.username} {game.opponent.rating ? `(${game.opponent.rating})` : ''}
          </button>
          <div className="text-sm text-gray-400">
            {t('home.list.card.type')}: {game.time_class}
          </div>
        </div>
        <div
          className={`ml-auto px-2 py-1 rounded text-xs ${getResultBgClass(game.resultForUser)}`}
        >
          {t(`common.result.${game.resultForUser}`)}
        </div>
      </div>
      <div className="text-sm text-gray-300">
        {t('home.list.card.myElo')}: {typeof myRating === 'number' ? myRating : '—'}
      </div>
      <div className="flex gap-2 mt-2">
        <button
          className="flex-1 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-primary/20 text-slate-300 hover:text-primary text-sm font-medium transition-all border border-transparent hover:border-primary/30"
          onAuxClick={(e) => {
            const username = game.userColor === 'white' ? game.white.username : game.black.username;
            const url = withLang(`/analyze`) + `?pgn=${encodeURIComponent(game.pgn || '')}&username=${encodeURIComponent(username || '')}` + `&white=${encodeURIComponent(JSON.stringify({ username: game.white.username, rating: game.white.rating }))}` + `&black=${encodeURIComponent(JSON.stringify({ username: game.black.username, rating: game.black.rating }))}`;
            window.open(url, '_blank');
          }}
          onClick={(e) => {
            const meta = (e as React.MouseEvent).metaKey || (e as React.MouseEvent).ctrlKey;
            const username = game.userColor === 'white' ? game.white.username : game.black.username;
            if (meta) {
              const url = withLang(`/analyze`) + `?pgn=${encodeURIComponent(game.pgn || '')}&username=${encodeURIComponent(username || '')}` + `&white=${encodeURIComponent(JSON.stringify({ username: game.white.username, rating: game.white.rating }))}` + `&black=${encodeURIComponent(JSON.stringify({ username: game.black.username, rating: game.black.rating }))}`;
              window.open(url, '_blank');
              return;
            }
            navigate(withLang('/analyze'), {
              state: {
                pgn: game.pgn,
                username: username,
                white: { username: game.white.username, rating: game.white.rating },
                black: { username: game.black.username, rating: game.black.rating },
              },
            });
          }}
        >
          {t('home.list.card.view')}
        </button>
        <button
          className="btn-ghost"
          onAuxClick={(e) => {
            const username = game.userColor === 'white' ? game.white.username : game.black.username;
            const url = withLang(`/analyze`) + `?pgn=${encodeURIComponent(game.pgn || '')}&username=${encodeURIComponent(username || '')}&analyze=1` + `&white=${encodeURIComponent(JSON.stringify({ username: game.white.username, rating: game.white.rating }))}` + `&black=${encodeURIComponent(JSON.stringify({ username: game.black.username, rating: game.black.rating }))}`;
            window.open(url, '_blank');
          }}
          onClick={(e) => {
            const meta = (e as React.MouseEvent).metaKey || (e as React.MouseEvent).ctrlKey;
            const username = game.userColor === 'white' ? game.white.username : game.black.username;
            if (meta) {
              const url = withLang(`/analyze`) + `?pgn=${encodeURIComponent(game.pgn || '')}&username=${encodeURIComponent(username || '')}&analyze=1` + `&white=${encodeURIComponent(JSON.stringify({ username: game.white.username, rating: game.white.rating }))}` + `&black=${encodeURIComponent(JSON.stringify({ username: game.black.username, rating: game.black.rating }))}`;
              window.open(url, '_blank');
              return;
            }
            navigate(withLang('/analyze'), {
              state: {
                pgn: game.pgn,
                username: username,
                analyze: true,
                white: { username: game.white.username, rating: game.white.rating },
                black: { username: game.black.username, rating: game.black.rating },
              },
            });
          }}
        >
          {t('home.list.card.analyze', 'Analyser')}
        </button>
      </div>
    </div>
  );
}
