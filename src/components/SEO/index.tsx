import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { SUPPORTED_LANGS, DEFAULT_LANG } from '../../i18n';

interface SEOProps {
    title: string;
    description?: string;
    keywords?: string;
    image?: string;
    type?: 'website' | 'article' | 'profile';
}

const DOMAIN = 'https://chesschronicles.com';

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    image = '/img/og-image.jpg',
    type = 'website',
}) => {
    const { i18n } = useTranslation();
    const location = useLocation();
    const currentLang = i18n.language;

    let rawPath = location.pathname;

    const langPrefixRegex = new RegExp(`^/(${SUPPORTED_LANGS.join('|')})`);
    let purePath = rawPath.replace(langPrefixRegex, '');

    if (!purePath) purePath = '/';

    const getUrlForLang = (lang: string) => {
        const langPrefix = lang === DEFAULT_LANG ? '' : `/${lang}`;

        const suffix = purePath === '/' ? '' : purePath;

        return `${DOMAIN}${langPrefix}${suffix}`;
    };

    const canonicalUrl = getUrlForLang(currentLang);

    return (
        <Helmet>
            <html lang={currentLang} />
            {/* --- Balises Standard --- */}
            <title>{title} | Chess Chronicles</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={canonicalUrl} />

            {/* --- Open Graph (Facebook/LinkedIn) --- */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={`${DOMAIN}${image}`} />
            <meta property="og:site_name" content="Chess Chronicles" />
            <meta property="og:locale" content={currentLang} />

            {/* --- Twitter --- */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={`${DOMAIN}${image}`} />

            {/* --- SEO International (Hreflang) --- */}
            {SUPPORTED_LANGS.map((lang) => (
                <link
                    key={lang}
                    rel="alternate"
                    hrefLang={lang}
                    href={getUrlForLang(lang)}
                />
            ))}

            <link
                rel="alternate"
                hrefLang="x-default"
                href={getUrlForLang(DEFAULT_LANG)}
            />
        </Helmet>
    );
};