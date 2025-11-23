import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlSettings } from 'react-icons/sl';
import { useChessStore } from '../../store';
import type { StockfishSettingsModalProps } from './types';
import { STOCKFISH_VERSION_OPTIONS, STOCKFISH_DEPTH_LIMITS } from './utils';

export function StockfishSettingsModal({ isOpen, onClose }: StockfishSettingsModalProps) {
  const { t } = useTranslation();
  const { stockfishVersion, stockfishDepth, setStockfishVersion, setStockfishDepth } =
    useChessStore();

  const [localVersion, setLocalVersion] = useState(stockfishVersion);
  const [localDepth, setLocalDepth] = useState(stockfishDepth);

  const handleSave = () => {
    setStockfishVersion(localVersion);
    setStockfishDepth(localDepth);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <SlSettings className="h-5 w-5 text-primary" />
            {t('analyze.engine.settings.title', "Réglages de l'analyse")}
          </h2>
        </div>

        <div className="space-y-6">
          {/* Version Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              {t('analyze.engine.settings.version', 'Version de Stockfish')}
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setLocalVersion('lite')}
                className={`flex-1 px-3 py-2 rounded font-medium transition-all ${localVersion === 'lite'
                  ? 'bg-primary text-white font-semibold shadow-lg shadow-primary/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 hover:border-white/20'
                  }`}
              >
                {t(STOCKFISH_VERSION_OPTIONS.lite)}
              </button>
              <button
                onClick={() => setLocalVersion('normal')}
                className={`flex-1 px-3 py-2 rounded font-medium transition-all ${localVersion === 'normal'
                  ? 'bg-primary text-white font-semibold shadow-lg shadow-primary/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 hover:border-white/20'
                  }`}
              >
                {t(STOCKFISH_VERSION_OPTIONS.normal)}
              </button>
            </div>
          </div>

          {/* Depth Selection */}
          <div>
            <label htmlFor="depth-input" className="block text-sm font-medium text-gray-300 mb-3">
              {t(
                'analysis.settings.depth',
                `Profondeur (${STOCKFISH_DEPTH_LIMITS.min}-${STOCKFISH_DEPTH_LIMITS.max})`
              )}
            </label>
            <input
              id="depth-input"
              type="number"
              min={STOCKFISH_DEPTH_LIMITS.min}
              max={STOCKFISH_DEPTH_LIMITS.max}
              value={localDepth}
              onChange={(e) => setLocalDepth(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 hover:border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
          >
            {t('common.cancel', 'Annuler')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg font-medium text-white bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            {t('common.save', 'Enregistrer')}
          </button>
        </div>
      </div>
    </div>
  );
}
