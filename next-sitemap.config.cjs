/** @type {import('next-sitemap').IConfig} */
const fg = require('fast-glob');

const SITE = 'https://socalsolver.com';
const LANGUAGES = ['it', 'en', 'es', 'fr'];

module.exports = {
  siteUrl: SITE,
  generateRobotsTxt: true,
  outDir: 'public',
  sitemapSize: 5000,
  trailingSlash: false,
  exclude: ['/xn/**', '/xs/**', '/xr/**', '/api/**', '/draft/**'],

  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      {
        userAgent: '*',
        disallow: ['/xn', '/xn/*', '/xs', '/xs/*', '/xr', '/xr/*', '/api/*', '/draft/*']
      },
    ],
    additionalSitemaps: [
      `${SITE}/sitemap.xml`,
      `${SITE}/sitemap-0.xml`,
    ],
  },

  transform: async (config, url) => {
    // Higher priority for home pages and category pages
    let priority = 0.7;
    let changefreq = 'weekly';

    if (url === '/' || url.match(/^\/(it|en|es|fr)$/)) {
      priority = 1.0;
      changefreq = 'daily';
    } else if (url.match(/^\/(it|en|es|fr)\/[^/]+$/)) {
      // Category pages
      priority = 0.8;
      changefreq = 'weekly';
    } else if (url.match(/^\/(it|en|es|fr)\/[^/]+\/[^/]+$/)) {
      // Calculator pages
      priority = 0.9;
      changefreq = 'weekly';
    }

    return {
      loc: `${config.siteUrl}${url}`,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
      // Add alternate links for i18n
      alternateRefs: LANGUAGES.map((lang) => ({
        href: `${config.siteUrl}/${lang}${url.replace(/^\/(it|en|es|fr)/, '')}`,
        hreflang: lang,
      })),
    };
  },

  additionalPaths: async () => {
    const extra = [];

    // Add content markdown files for ALL languages
    for (const lang of LANGUAGES) {
      try {
        const mdFiles = await fg([`content/${lang}/**/*.md`, `content/${lang}/**/*.mdx`], {
          dot: false,
        });

        for (const file of mdFiles) {
          const rel = file
            .replace(new RegExp(`^content/${lang}/`), '')
            .replace(/\.mdx?$/i, '')
            .replace(/\/index$/i, '');

          extra.push({
            loc: `/${lang}/${rel}`,
            lastmod: new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.8,
          });
        }
      } catch (error) {
        console.warn(`Warning: Could not find content for language: ${lang}`);
      }
    }

    return extra;
  },
};
