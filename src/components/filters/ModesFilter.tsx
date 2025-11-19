import { FilterSection } from './FilterSection';
import { useTranslation } from 'react-i18next';
import { Option } from './types';

type Props = {
  value: string[];
  onChange: (modes: string[]) => void;
  title?: string;
};

/** Filter by time control (multi-select). */
export function ModesFilter({ value, onChange, title = 'Type de Partie' }: Props) {
  const { t } = useTranslation();
  const options: Option[] = [
    { value: 'bullet', label: t('mode.bullet') },
    { value: 'blitz', label: t('mode.blitz') },
    { value: 'rapid', label: t('mode.rapid') },
    { value: 'daily', label: t('mode.daily') },
  ];

  const toggleMode = (mode: string) => {
    if (value.includes(mode)) {
      onChange(value.filter((m) => m !== mode));
    } else {
      onChange([...value, mode]);
    }
  };

  return (
    <FilterSection title={title}>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const isSelected = value.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => toggleMode(option.value)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${isSelected
                  ? 'bg-primary/20 border-primary/50 text-white shadow-sm shadow-primary/10'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600/50 hover:text-slate-200'
                }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </FilterSection>
  );
}
