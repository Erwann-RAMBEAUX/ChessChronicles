import { FilterSection } from './FilterSection';
import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';

type Props = {
  query: string;
  suggestions: string[];
  onChange: (q: string) => void;
  title?: string;
};

/** Filter by opponent username, with lightweight suggestions. */
export function OpponentFilter({ query, suggestions, onChange, title = 'Adversaire' }: Props) {
  const lower = query.toLowerCase();
  const top = lower ? suggestions.filter((s) => s.toLowerCase().includes(lower)).slice(0, 10) : [];
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const renderHighlighted = (s: string) => {
    if (!lower) return <>{s}</>;
    const idx = s.toLowerCase().indexOf(lower);
    if (idx === -1) return <>{s}</>;
    const before = s.slice(0, idx);
    const match = s.slice(idx, idx + lower.length);
    const after = s.slice(idx + lower.length);
    return (
      <>
        <span className="text-slate-400">{before}</span>
        <span className="font-semibold text-slate-100">{match}</span>
        <span className="text-slate-400">{after}</span>
      </>
    );
  };

  return (
    <div className="relative">
      <FilterSection title={title}>
        <input
          ref={inputRef}
          className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          placeholder={t('filters.searchOpponent')}
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
        />
      </FilterSection>
      {open && query && (
        <div className="absolute z-10 mt-1 w-full bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-xl max-h-56 overflow-auto">
          {top.length === 0 && <div className="text-xs text-slate-400 px-3 py-2">—</div>}
          {top.map((s) => (
            <button
              key={s}
              className="block w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors truncate"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(s);
                setOpen(false);
                inputRef.current?.blur();
              }}
              title={s}
            >
              {renderHighlighted(s)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
