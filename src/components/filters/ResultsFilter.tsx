import { FilterSection } from './FilterSection';
import { useTranslation } from 'react-i18next';
import { Option } from './types';

type Props = {
  value: 'all' | 'win' | 'loss' | 'draw';
  onChange: (res: 'all' | 'win' | 'loss' | 'draw') => void;
  title?: string;
};

/** Filter by result (single-select with All). */
export function ResultsFilter({ value, onChange, title = 'Result' }: Props) {
  const { t } = useTranslation();
  const options: Option[] = [
    { value: 'all', label: t('home.filters.all') },
    { value: 'win', label: t('common.result.win') },
    { value: 'loss', label: t('common.result.loss') },
    { value: 'draw', label: t('common.result.draw') },
  ];
  return (
    <FilterSection title={title}>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value as 'all' | 'win' | 'loss' | 'draw')}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${value === option.value
                ? 'bg-primary/20 border-primary/50 text-white shadow-sm shadow-primary/10'
                : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600/50 hover:text-slate-200'
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </FilterSection>
  );
}
