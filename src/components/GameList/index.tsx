import { useFilteredGames, useChessStore } from '../../store';
import { GameCard } from '../GameCard';
import { FilterSection } from '../filters/FilterSection';
import { useTranslation } from 'react-i18next';
import { PER_PAGE_OPTIONS, calculatePaginationState, generatePaginationItems } from './utils';

export function GameList() {
  const games = useFilteredGames();
  const { loading, games: all, page, pageSize, setPage, setPageSize } = useChessStore();
  const { t } = useTranslation();

  const { current, totalPages, start, end } = calculatePaginationState(games, page, pageSize);
  const pageItems = games.slice(start, end);
  const paginationItems = generatePaginationItems(current, totalPages);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-lg">{t('home.list.title')}</h3>
        <div className="flex items-center gap-3 text-sm text-gray-300">
          <label className="hidden sm:block">{t('home.filters.perPage')}</label>
          <div className="relative w-20">
            <select
              value={pageSize.toString()}
              onChange={(e) => setPageSize(parseInt(e.target.value) || 15)}
              className="w-full appearance-none bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
            >
              {PER_PAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-800 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          <div className="text-gray-400">
            {t('home.list.total', { count: games.length, current, total: totalPages })}{' '}
            {loading ? t('home.list.loading') : ''}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {pageItems.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
        {loading &&
          !all.length &&
          Array.from({ length: Math.min(6, pageSize) }).map((_, i) => (
            <div key={i} className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 animate-pulse h-32" />
          ))}
      </div>
      {!all.length && !loading && <div className="text-gray-400">{t('home.list.empty')}</div>}
      {games.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <button
            className="px-3 py-1 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage(current - 1)}
            disabled={current <= 1}
          >
            {t('home.filters.prev')}
          </button>
          <div className="flex items-center gap-2">
            {paginationItems.map((it, idx) =>
              it === 'gap' ? (
                <span key={`gap-${idx}`} className="px-1 text-gray-400">
                  …
                </span>
              ) : (
                <button
                  key={it}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition-all ${current === it
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  onClick={() => setPage(it)}
                >
                  {it}
                </button>
              )
            )}
          </div>
          <button
            className="px-3 py-1 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage(current + 1)}
            disabled={current >= totalPages}
          >
            {t('home.filters.next')}
          </button>
        </div>
      )}
    </div>
  );
}
