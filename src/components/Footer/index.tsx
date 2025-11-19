import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FaGithub } from 'react-icons/fa';
import { withLang } from '../../i18n';

export const Footer = () => {
    const { t, i18n } = useTranslation();

    return (
        <footer className="border-t border-slate-800/50 bg-[#020617] py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div className="flex items-center gap-3">
                        <img src="/favicon/favicon.svg" alt={t('app.logoAlt')} className="h-8 w-8" />
                        <span className="text-xl font-bold text-white tracking-tight">{t('app.title')}</span>
                    </div>

                    <a
                        href="https://github.com/Erwann-RAMBEAUX/ChessChronicles"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all border border-slate-700/50 hover:border-primary/50"
                    >
                        <FaGithub size={20} />
                    </a>
                </div>

                <div className="h-px bg-slate-800/50 w-full mb-8" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <p className="text-slate-500 text-sm">{t('home.footer.text')}</p>
                        <Link to={withLang('/about', i18n.language)} className="text-sm text-slate-400 hover:text-primary transition-colors">
                            {t('nav.about')}
                        </Link>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-3 py-1 bg-slate-900/50 border border-slate-800 rounded-full text-xs font-medium text-slate-400">
                            {t('home.privacy.badges.openSource')}
                        </div>
                        <div className="px-3 py-1 bg-slate-900/50 border border-slate-800 rounded-full text-xs font-medium text-slate-400">
                            {t('home.privacy.badges.free')}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
