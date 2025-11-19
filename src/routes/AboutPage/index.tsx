import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaGithub, FaEnvelope, FaRobot, FaChessKnight, FaLanguage } from 'react-icons/fa';
import { SEO } from '../../components/SEO';
import { Layout } from '../../components/Layout';


const AboutPage = () => {
    const { t } = useTranslation();

    return (
        <Layout>
            <SEO
                title={t('about.title')}
                description={t('about.description')}
            />

            <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">

                {/* En-tête */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-100 mb-4">
                        {t('about.title')}
                    </h1>
                    <p className="text-xl text-gray-400">
                        {t('about.subtitle')}
                    </p>
                </div>

                <div className="space-y-12">

                    {/* Section Mission */}
                    <section className="bg-surface-light rounded-xl p-6 border border-gray-700 shadow-lg">
                        <div className="flex items-center mb-4 text-primary-400">
                            <FaChessKnight className="text-2xl mr-3" />
                            <h2 className="text-2xl font-semibold text-gray-200">{t('about.mission_title')}</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            {t('about.mission_text')}
                        </p>
                    </section>

                    {/* Section AI Story */}
                    <section className="bg-surface-light rounded-xl p-6 border border-gray-700 shadow-lg">
                        <div className="flex items-center mb-4 text-blue-400">
                            <FaRobot className="text-2xl mr-3" />
                            <h2 className="text-2xl font-semibold text-gray-200">{t('about.story_title')}</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            {t('about.story_text')}
                        </p>
                    </section>

                    {/* Section Traduction */}
                    <section className="bg-surface-light rounded-xl p-6 border border-gray-700 shadow-lg">
                        <div className="flex items-center mb-4 text-yellow-500">
                            <FaLanguage className="text-2xl mr-3" />
                            <h2 className="text-2xl font-semibold text-gray-200">{t('about.translation_title')}</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed italic border-l-4 border-yellow-500 pl-4 bg-gray-800/50 py-2">
                            {t('about.translation_text')}
                        </p>
                    </section>

                    {/* Section Contact & Liens */}
                    <section className="mt-12 text-center">
                        <h2 className="text-2xl font-semibold text-gray-200 mb-8">{t('about.contact_title')}</h2>

                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            {/* Bouton GitHub */}
                            <a
                                href="https://github.com/Erwann-RAMBEAUX"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 border border-gray-600"
                            >
                                <FaGithub className="mr-2 text-xl" />
                                <span>GitHub</span>
                            </a>

                            {/* Bouton Email */}
                            <a
                                href="mailto:contact@chesschronicles.com"
                                className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                            >
                                <FaEnvelope className="mr-2 text-xl" />
                                <span>{t('about.email_text')}</span>
                            </a>
                        </div>
                    </section>

                </div>
            </div>
        </Layout>
    );
};

export default AboutPage;