import { FilterSection } from './FilterSection';
import { Option } from './types';
import { useTranslation } from 'react-i18next';

type Props = {
  months: string[];
  value: string;
  onChange: (m: string) => void;
  title?: string;
  allLabel?: string;
};

/** Filter by month (YYYY-MM). */
export function MonthFilter({ months, value, onChange, title = 'Mois', allLabel = 'Tous' }: Props) {
  const { t, i18n } = useTranslation();

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const formatted = new Intl.DateTimeFormat(i18n.language, {
      month: 'long',
      year: 'numeric',
    }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const options: Option[] = [
    { value: 'all', label: allLabel },
    ...months.map((m) => ({ value: m, label: formatMonth(m) })),
  ];
  return (
    <FilterSection title={title} inline>
      <div className="relative w-full">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
        >
          {options.map((opt) => (
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
    </FilterSection>
  );
}
