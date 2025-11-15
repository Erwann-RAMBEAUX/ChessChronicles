import { FilterSection } from './FilterSection'
import { useTranslation } from 'react-i18next'
import { useRef, useState } from 'react'

type Props = {
  query: string
  suggestions: string[]
  onChange: (q: string) => void
  title?: string
}

/** Filter by opponent username, with lightweight suggestions. */
export function OpponentFilter({ query, suggestions, onChange, title = 'Adversaire' }: Props) {
  const lower = query.toLowerCase()
  const top = lower ? suggestions.filter(s => s.toLowerCase().includes(lower)).slice(0, 10) : []
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  return (
    <div>
      <FilterSection title={title}>
        <input
          ref={inputRef}
          className="input w-full"
          placeholder={t('filters.searchOpponent')}
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
        />
      </FilterSection>
      {open && query && (
        <div className="card mt-2 p-2 max-h-56 overflow-auto">
          {top.length === 0 && (
            <div className="text-sm text-gray-400 px-2 py-1">—</div>
          )}
          {top.map(s => (
            <button
              key={s}
              className="block w-full text-left px-2 py-1 rounded hover:bg-white/10"
              onMouseDown={(e) => {
                // Select before blur, avoid focus change
                e.preventDefault()
                onChange(s)
                setOpen(false)
                inputRef.current?.blur()
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
