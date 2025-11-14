import { useFilteredGames, useChessStore } from '../store'
import { GameCard } from './GameCard'
import { Dropdown, type Option } from './ui/Dropdown'
import { useTranslation } from 'react-i18next'

export function GameList() {
  const games = useFilteredGames()
  const { loading, games: all, page, pageSize, setPage, setPageSize } = useChessStore()
  const { t } = useTranslation()

  const totalPages = Math.max(1, Math.ceil(games.length / pageSize))
  const current = Math.min(page, totalPages)
  const start = (current - 1) * pageSize
  const end = start + pageSize
  const pageItems = games.slice(start, end)

  const perPageOptions: Option[] = [
    { value: '15', label: '15' },
    { value: '30', label: '30' },
    { value: '50', label: '50' },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-lg">{t('list.title')}</h3>
        <div className="flex items-center gap-3 text-sm text-gray-300">
          <label className="hidden sm:block">{t('filters.perPage')}</label>
          <Dropdown options={perPageOptions} value={pageSize.toString()} onChange={(v) => setPageSize(parseInt(v) || 15)} widthClass="w-20" />
          <div className="text-gray-400">{t('list.total', { count: games.length, current, total: totalPages })} {loading ? t('list.loading') : ''}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {pageItems.map(g => <GameCard key={g.id} game={g} />)}
        {loading && !all.length && Array.from({ length: Math.min(6, pageSize) }).map((_, i) => (
          <div key={i} className="card p-4 animate-pulse h-32 bg-white/5" />
        ))}
      </div>
      {!all.length && !loading && (
        <div className="text-gray-400">{t('list.empty')}</div>
      )}
      {games.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <button className="btn-ghost" onClick={() => setPage(current - 1)} disabled={current <= 1}>{t('filters.prev')}</button>
          <div className="flex items-center gap-2">
            {(() => {
              const items: (number | 'gap')[] = []
              const last = totalPages
              if (last > 0) {
                // toujours 1 au début
                items.push(1)
                if (current === 1) {
                  if (last >= 2) items.push(2)
                  if (last > 3) items.push('gap')
                } else if (current === last) {
                  if (last > 3) items.push('gap')
                  if (last - 1 >= 2) items.push(last - 1)
                } else {
                  const left = current - 1
                  const right = current + 1
                  if (left > 2) items.push('gap')
                  ;[left, current, right].forEach(n => {
                    if (n !== 1 && n !== last && !items.includes(n as number)) items.push(n)
                  })
                  if (right < last - 1) items.push('gap')
                }
                // pousser 'last' une seule fois à la fin
                if (last > 1 && !items.includes(last)) items.push(last)
              }
              return items.map((it, idx) =>
                it === 'gap' ? (
                  <span key={`gap-${idx}`} className="px-1 text-gray-400">…</span>
                ) : (
                  <button key={it} className={`btn-ghost h-9 w-9 ${current===it?'ring-2 ring-primary/60':''}`} onClick={() => setPage(it)}>{it}</button>
                )
              )
            })()}
          </div>
          <button className="btn-ghost" onClick={() => setPage(current + 1)} disabled={current >= totalPages}>{t('filters.next')}</button>
        </div>
      )}
    </div>
  )
}
