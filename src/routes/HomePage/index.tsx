import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { withLang } from '../../i18n';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/Layout';
import { SEO } from '../../components/SEO';
import {
  FaSearch,
  FaQuestionCircle,
  FaChevronDown,
  FaChevronUp,
  FaChartLine,
  FaRobot,
  FaLightbulb,
  FaChessBoard,
  FaTrophy,
  FaInfoCircle,
} from 'react-icons/fa';

const FaqItem = ({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) => {
  return (
    <div className={`border border-slate-700/50 rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-slate-800/50 border-primary/30 shadow-lg shadow-primary/5' : 'bg-slate-900/30 hover:bg-slate-800/30'}`}>
      <button
        className="w-full py-5 px-6 flex justify-between items-center text-left focus:outline-none group"
        onClick={onClick}
      >
        <h3 className={`text-lg font-medium transition-colors pr-4 ${isOpen ? 'text-primary' : 'text-slate-200 group-hover:text-white'}`}>
          {question}
        </h3>
        <div className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-primary/10 text-primary' : 'bg-slate-800 text-slate-400 group-hover:text-white'}`}>
          {isOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
        </div>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="pb-6 px-6 text-slate-400 leading-relaxed border-t border-slate-700/30 pt-4">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      navigate(withLang(`/player/${encodeURIComponent(username.trim())}`));
    }
  };

  return (
    <Layout>
      <SEO
        title={t('common.appName')}
        description={t('seo.home.description', t('home.hero.subtitle'))}
        keywords={t('seo.keywords')}
        jsonLd={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebSite',
              name: 'Chess Chronicles',
              url: 'https://chesschronicles.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `https://chesschronicles.com/${i18n.language}/player/{search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
              inLanguage: ['fr', 'en', 'es', 'it', 'pt', 'hi', 'ru'],
            },
            {
              '@type': 'FAQPage',
              mainEntity: [1, 2, 3, 4, 5, 6].map((i) => ({
                '@type': 'Question',
                name: t(`home.faq.q${i}`),
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: t(`home.faq.a${i}`),
                },
              })),
            },
          ],
        }}
      />
      <main className="space-y-24 md:space-y-32 pb-24">
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/40 border border-slate-700/50 text-primary text-sm font-medium backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-lg shadow-primary/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t('home.hero.releaseBadge')}
            </div>

            <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 animate-in fade-in zoom-in duration-700 leading-[0.9] bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent drop-shadow-2xl pb-2 pr-2">
              {t('common.appName')}
            </h1>

            <p className="text-xl md:text-3xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              {t('home.hero.subtitle')}
            </p>

            <div className="max-w-2xl mx-auto relative group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <form onSubmit={handleSubmit} className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2 shadow-2xl">
                <div className="pl-4 text-slate-400">
                  <FaSearch className="text-xl" />
                </div>
                <input
                  type="text"
                  placeholder={t('home.search.placeholder')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-lg text-white placeholder:text-slate-600 px-4 py-3" />
                <button
                  type="submit"
                  disabled={!username.trim()}
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                >
                  {t('home.search.button')}
                </button>
              </form>
            </div>
          </div>
        </section>



        {/* BENTO GRID FEATURES */}
        <section className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{t('home.features.deepDive.title')}</h2>
            <p className="text-slate-400 text-lg">{t('home.features.tagline')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
            {/* Large Card - Stockfish */}
            <div className="md:col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <FaRobot size={120} />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400 mb-6">
                  <FaRobot size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t('home.features.cards.stockfish.title')}</h3>
                  <p className="text-slate-400 max-w-md">{t('home.features.cards.stockfish.desc')}</p>
                </div>
              </div>
            </div>

            <div className="md:row-span-2 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6">
                  <FaChartLine size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{t('home.features.cards.progress.title')}</h3>
                <p className="text-slate-400 mb-8 flex-grow">{t('home.features.cards.progress.desc')}</p>
                <div className="h-32 w-full bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-end justify-around p-4 gap-2">
                  {[40, 60, 45, 70, 55, 80, 65].map((h, i) => (
                    <div key={i} className="w-full bg-blue-500/20 rounded-t-sm relative group-hover:bg-blue-500/40 transition-colors" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 group hover:border-purple-500/30 transition-all duration-500">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-6">
                <FaChessBoard size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('home.features.cards.pgnviewer.title')}</h3>
              <p className="text-slate-400 text-sm">{t('home.features.cards.pgnviewer.desc')}</p>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 group hover:border-orange-500/30 transition-all duration-500">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400 mb-6">
                <FaLightbulb size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('home.features.deepDive.analysis.title')}</h3>
              <p className="text-slate-400 text-sm">{t('home.features.deepDive.analysis.desc')}</p>
            </div>

            <div className="md:col-span-3 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 backdrop-blur-sm border border-amber-700/30 rounded-3xl p-8 relative overflow-hidden group hover:border-amber-500/50 transition-all duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <FaTrophy size={100} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 flex-shrink-0">
                  <FaTrophy size={32} />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">{t('home.features.masterGames.title')}</h3>
                  <p className="text-slate-400 max-w-2xl">{t('home.features.masterGames.desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white text-center mb-20">{t('home.howItWorks')}</h2>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 md:left-1/2 md:translate-x-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/0 via-primary/50 to-primary/0" />

            <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-20 group">
              <div className="md:w-1/2 text-center md:text-right order-2 md:order-1">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{t('home.steps.step1.title')}</h3>
                <p className="text-slate-400">{t('home.steps.step1.desc')}</p>
              </div>
              <div className="relative z-10 flex-shrink-0 order-1 md:order-2">
                <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.3)] group-hover:border-primary transition-colors duration-300">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
              </div>
              <div className="md:w-1/2 order-3 hidden md:block" />
            </div>

            <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-20 group">
              <div className="md:w-1/2 hidden md:block order-1" />
              <div className="relative z-10 flex-shrink-0 order-1 md:order-2">
                <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:border-blue-500 transition-colors duration-300">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
              </div>
              <div className="md:w-1/2 order-2 md:order-3 text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-500 transition-colors">{t('home.steps.step2.title')}</h3>
                <p className="text-slate-400">{t('home.steps.step2.desc')}</p>
              </div>
            </div>

            <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
              <div className="md:w-1/2 text-center md:text-right order-2 md:order-1">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-500 transition-colors">{t('home.steps.step3.title')}</h3>
                <p className="text-slate-400">{t('home.steps.step3.desc')}</p>
              </div>
              <div className="relative z-10 flex-shrink-0 order-1 md:order-2">
                <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:border-purple-500 transition-colors duration-300">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
              </div>
              <div className="md:w-1/2 order-3 hidden md:block" />
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10 opacity-20" />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                <div className="space-y-4 text-center md:text-left">
                  <h2 className="text-3xl md:text-5xl font-bold text-white">{t('home.video.title')}</h2>
                  <p className="text-slate-400 text-lg max-w-xl">{t('home.video.subtitle')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-red-600/20 text-red-500 rounded-full text-sm font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    LIVE DEMO
                  </div>
                </div>
              </div>

              <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-lg ring-1 ring-white/10 group">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/znWmcO8lrKU?modestbranding=1&rel=0"
                  title={t('home.video.iframeTitle')}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wider mb-4">
              <FaQuestionCircle /> FAQ
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{t('home.faq.title')}</h2>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <FaqItem
                key={index}
                question={t(`home.faq.q${index}`)}
                answer={t(`home.faq.a${index}`)}
                isOpen={activeFaq === index}
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
              />
            ))}
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {t('home.seo.title')}
                </h2>
              </div>
              <p className="text-lg text-slate-300 leading-relaxed text-center">
                {t('home.seo.text')}
              </p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
