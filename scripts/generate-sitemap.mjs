import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
const DOMAIN = 'https://chesschronicles.com';
const LANGUAGES = ['fr', 'en', 'es', 'it', 'hi', 'ru', 'pt'];
const PAGES = [
    '',
    'player',
    'legendary',
    'game',
    'about',
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');

function generateSitemap() {
    const date = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    PAGES.forEach((page) => {
        LANGUAGES.forEach((currentLang) => {
            const pagePath = page ? `/${page}` : '';
            const loc = `${DOMAIN}/${currentLang}${pagePath}`;

            xml += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>`;

            LANGUAGES.forEach((altLang) => {
                const altPath = page ? `/${page}` : '';
                const href = `${DOMAIN}/${altLang}${altPath}`;
                xml += `
    <xhtml:link rel="alternate" hreflang="${altLang}" href="${href}" />`;
            });

            xml += `
    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/en${pagePath}" />`;

            xml += `
  </url>`;
        });
    });

    // Custom URLs for SEO (Force indexing of specific dynamic content)
    const CUSTOM_URLS = [
        '/player/Hikaru',
        '/analyze?pgn=%5BWhite%20%22Hikaru%22%5D%20%5BBlack%20%22MagnusCarlsen%22%5D%20%5BWhiteElo%20%223402%22%5D%20%5BBlackElo%20%223296%22%5D%201.e4%20e5%202.Qh5%20Nc6%203.Bc4%20Nf6%204.Qxf7%23'
    ];

    CUSTOM_URLS.forEach((customUrl) => {
        LANGUAGES.forEach((currentLang) => {
            const loc = `${DOMAIN}/${currentLang}${customUrl}`;

            xml += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>`;

            LANGUAGES.forEach((altLang) => {
                const href = `${DOMAIN}/${altLang}${customUrl}`;
                xml += `
    <xhtml:link rel="alternate" hreflang="${altLang}" href="${href}" />`;
            });

            xml += `
    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/en${customUrl}" />`;

            xml += `
  </url>`;
        });
    });

    xml += `
</urlset>`;

    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml);
}

generateSitemap();