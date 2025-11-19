import { useTranslation } from 'react-i18next';

export function StatsTile({
  icon,
  label,
  current,
  best,
  bestDate,
  record,
}: {
  icon: React.ReactNode;
  label: string;
  current: number | string;
  best?: number | string;
  bestDate?: string | undefined;
  record?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 bg-slate-700/30 border border-slate-600/30 rounded-xl px-4 py-3 hover:bg-slate-700/50 transition-colors">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400 truncate">{label}</div>
        <div className="flex items-baseline gap-2">
          <div className="text-lg font-semibold text-white">{current}</div>
          {record && <div className="text-xs text-gray-400">{record}</div>}
        </div>
        {best !== undefined && best !== null && best !== '—' && (
          <div className="text-xs text-gray-400">
            {`${t('profile.best')}: ${best} ${bestDate ? `(${bestDate})` : ''}`}
          </div>
        )}
      </div>
    </div>
  );
}
