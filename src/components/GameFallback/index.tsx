import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { withLang } from '../../i18n';
import { useState } from 'react';
import type { GameFallbackProps } from './types';

export function GameFallback({
  manualPgnInput,
  setManualPgnInput,
  manualPgn,
  isError,
  onCancelManual,
  onInjectPGN,
  errorMessage,
}: GameFallbackProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profileSearch, setProfileSearch] = useState('');

  return (
    <div className="flex justify-center">
      <div
        className={`p-6 space-y-4 w-full max-w-md rounded-xl border shadow-lg ${isError
          ? 'bg-red-500/10 backdrop-blur-md border-red-500/30'
          : 'bg-slate-800/30 backdrop-blur-md border-slate-700/50'
          }`}
      >
        {/* Header */}
        {isError ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-red-500 rounded"></div>
              <h2 className="font-semibold text-sm text-red-400">
                {errorMessage
                  ? t('analyze.fallback.invalidPgn', 'PGN invalide')
                  : t('analyze.fallback.title', 'Partie introuvable')}
              </h2>
            </div>
            <p className="text-xs text-red-300/80">
              {errorMessage ||
                t('analyze.fallback.desc', 'Collez un PGN ci-dessous pour analyser une partie.')}
            </p>
          </>
        ) : (
          <>
            <h2 className="font-semibold text-sm">{t('analyze.analyze', 'Analyser une partie')}</h2>
            <p className="text-xs text-gray-400">
              {t('analyze.fallback.analyzeDesc', "Collez un PGN pour commencer l'analyse.")}
            </p>
          </>
        )}

        {/* PGN Input */}
        <div className="space-y-1">
          <label className="block text-xs uppercase tracking-wide text-gray-400">{t('analyze.fallback.pgnLabel')}</label>
          <textarea
            value={manualPgnInput}
            onChange={(e) => setManualPgnInput(e.target.value)}
            rows={6}
            placeholder={t('analyze.fallback.pgnPlaceholder', 'Collez votre PGN ici...')}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none"
          />
          <button
            disabled={!manualPgnInput.trim()}
            onClick={onInjectPGN}
            className="w-full h-9 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {t('analyze.fallback.inject', 'Analyser ce PGN')}
          </button>
          {manualPgn && (
            <button onClick={onCancelManual} className="w-full h-9 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-xs font-medium transition-all">
              {t('analyze.fallback.cancelManual', 'Annuler')}
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700/50"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-inherit text-gray-400">{t('analyze.or', 'Ou')}</span>
          </div>
        </div>

        {/* Profile Search */}
        <div className="space-y-1">
          <label className="block text-xs uppercase tracking-wide text-gray-400">
            {t('profile.user', 'Profil')}
          </label>
          <textarea
            value={profileSearch}
            onChange={(e) => setProfileSearch(e.target.value)}
            rows={1}
            placeholder={t('home.search.placeholder', "Nom d'un joueur...")}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && profileSearch.trim()) {
                navigate(withLang(`/player/${encodeURIComponent(profileSearch.trim())}`));
              }
            }}
          />
          <button
            disabled={!profileSearch.trim()}
            onClick={() => navigate(withLang(`/player/${encodeURIComponent(profileSearch.trim())}`))}
            className="w-full h-9 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {t('home.search.button')}
          </button>
        </div>
      </div>
    </div>
  );
}
