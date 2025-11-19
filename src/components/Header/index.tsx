import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { withLang } from '../../i18n';
import { LuVolume2, LuVolumeX } from 'react-icons/lu';
import { LuMenu, LuX } from 'react-icons/lu';
import { useState } from 'react';

import { useLanguageSync } from '../../hooks/useLanguageSync';
import { useChessStore } from '../../store';
import { isActiveRoute } from './utils';
import type { NavItem } from './types';

export function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const { clearCurrentGame, soundsEnabled, setSoundsEnabled } = useChessStore();
  useLanguageSync();

  const handleGameNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    clearCurrentGame();
    if (location.pathname.match(/\/(live|daily)\/game\//)) {
      window.dispatchEvent(new CustomEvent('resetGameForm'));
    } else {
      navigate(withLang('/game'));
    }
  };

  const navItems: NavItem[] = [
    { path: '/', label: t('nav.home') },
    { path: '/player', label: t('nav.player') },
    { path: '/game', label: t('nav.game', 'Analyser une partie'), onClick: handleGameNavClick },
    { path: '/legendary', label: t('nav.legendary') },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
          <Link
            to={withLang('/')}
            className="flex items-center gap-2 text-xl font-semibold hover:text-primary transition-colors"
          >
            <img src="/favicon/favicon.svg" alt={t('app.logoAlt')} className="h-8 w-8" />
            {t('app.title')}
          </Link>
          <div className="ml-auto flex items-center gap-6">
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden flex items-center justify-center text-gray-300 hover:text-white transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <LuX className="w-6 h-6" /> : <LuMenu className="w-6 h-6" />}
            </button>

            <nav className="hidden md:flex gap-6 text-sm text-gray-300">
              {navItems.map((item) => {
                const to = withLang(item.path === '/' ? '/' : item.path);
                return (
                  <Link
                    key={item.path}
                    to={to}
                    onClick={item.onClick}
                    className={`transition-all px-3 py-1.5 rounded-lg ${isActiveRoute(item.path, location.pathname)
                      ? 'text-white font-medium bg-white/10 shadow-sm shadow-white/5'
                      : 'hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={() => setSoundsEnabled(!soundsEnabled)}
              className="ml-auto flex items-center justify-center text-gray-300 hover:text-white transition-colors"
              title={
                soundsEnabled ? t('common.enabled', 'Activé') : t('common.disabled', 'Désactivé')
              }
            >
              {soundsEnabled ? (
                <LuVolume2 className="w-5 h-5" />
              ) : (
                <LuVolumeX className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl z-40">
            <div className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={`mobile-${item.path}`}
                  to={withLang(item.path === '/' ? '/' : item.path)}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    setMobileOpen(false);
                    item.onClick?.(e);
                  }}
                  className={`block px-4 py-3 text-base font-medium rounded-xl transition-all ${isActiveRoute(item.path, location.pathname)
                    ? 'text-white bg-primary/20 border border-primary/20 shadow-lg shadow-primary/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 active:bg-white/10'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
