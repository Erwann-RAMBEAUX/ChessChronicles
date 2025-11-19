import { FilterSection } from './FilterSection';
import { SortBy, SortDir } from '../../types';
import { Option } from './types';
import { useTranslation } from 'react-i18next';

type Props = {
  sortBy: SortBy;
  sortDir: SortDir;
  onChange: (p: Partial<{ sortBy: SortBy; sortDir: SortDir }>) => void;
  title?: string;
};

/** Controls for sorting: criterion and direction. */
export function SortControls({ sortBy, sortDir, onChange, title = 'Tri' }: Props) {
  const { t } = useTranslation();
  const byOptions: Option[] = [
    { value: 'date', label: t('filters.sortBy.date') },
    { value: 'elo_user', label: t('filters.sortBy.eloUser') },
    { value: 'elo_opponent', label: t('filters.sortBy.eloOpponent') },
  ];
  const dirOptions: Option[] = [
    { value: 'desc', label: t('filters.desc') },
    { value: 'asc', label: t('filters.asc') },
  ];
  return (
    <FilterSection title={title}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as SortBy })}
            className="w-full appearance-none bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
          >
            {byOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-800 text-slate-200">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="relative w-28">
          <select
            value={sortDir}
            onChange={(e) => onChange({ sortDir: e.target.value as SortDir })}
            className="w-full appearance-none bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
          >
            {dirOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-800 text-slate-200">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </FilterSection>
  );
}
