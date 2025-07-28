import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitepress';

import { getSpecSidebar } from '../utils/getSpecSidebar';

const root = dirname(fileURLToPath(import.meta.url));
const vuePkg = resolve(root, '../../packages/vue-dadata');
const typesPkg = resolve(root, '../../packages/api-types');
const schemaGenPkg = resolve(root, '../../packages/schema-gen');

const isProd = process.env.NODE_ENV === 'production';

let viteResolveAliases = {};

if (!isProd) {
  viteResolveAliases = {
    // in dev mode keep this before '@dadata-sdk/vue'
    '@dadata-sdk/vue/dist/vue-dadata.css': resolve(vuePkg, 'src/vue-dadata.css'),
  };
}

viteResolveAliases = {
  ...viteResolveAliases,

  // In dev, hot-reload from source; in build, consume the bundle
  '@dadata-sdk/vue': isProd ? vuePkg : resolve(vuePkg, 'src/index.ts'),

  '@dadata-sdk/api-types': isProd
    ? resolve(typesPkg, 'dist/esm/index.js')
    : resolve(typesPkg, 'src/index.ts'),
  '@dadata-sdk/schema-gen': isProd
    ? resolve(schemaGenPkg, 'dist/index.js')
    : resolve(schemaGenPkg, 'src/index.ts'),
};

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'DaData SDK',

  // <meta name="description" ...>
  description:
    'Full API contract in TypeScript and JSON-schema, full-featured "suggestions" component for Vue, playground to test "suggestions" API, and more.',

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    socialLinks: [{ icon: 'github', link: 'https://github.com/alexchexes/dadata-sdk' }],
    langMenuLabel: 'Change language | Выбрать язык',
  },

  cleanUrls: true,

  vite: {
    resolve: {
      alias: viteResolveAliases,
    },
    optimizeDeps: {
      include: ['@dadata-sdk/vue', '@dadata-sdk/api-types', '@vueuse/core'],
    },
    ssr: {
      noExternal: ['vue-i18n'],
    },
    define: {
      __VUE_PROD_DEVTOOLS__: false,
    },
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      link: '/en',

      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
          { text: 'OpenAPI spec', link: '/en/spec' },
          { text: 'API endpoints', link: '/en/api' },
          { text: 'Vue', link: '/en/vue' },
          { text: 'Demo', link: '/en/demo' },
        ],

        sidebar: [
          {
            items: [
              { text: 'Demo', link: '/en/demo' },
              { text: 'Vue component', link: '/en/vue' },
            ],
          },
          {
            items: [{ text: 'Schema generator', link: '/en/schema-gen' }],
          },
          {
            text: 'External links',
            items: [
              { text: 'GitHub Repo', link: 'https://github.com/alexchexes/dadata-sdk' },
              {
                text: 'JSON-schema',
                link: 'https://github.com/alexchexes/dadata-sdk/tree/rewritten/packages/api-spec/schemas',
              },
            ],
          },
          {
            text: 'OpenAPI spec',
            link: '/en/spec',
            items: [
              {
                text: 'List of all API endpoints',
                link: '/en/api',
              },
              ...getSpecSidebar('en'),
            ],
            collapsed: false,
          },
        ],
      },
    },
    ru: {
      label: 'Русский',
      lang: 'ru', // will be added  as `lang` attribute on `html` tag
      link: '/ru/',

      // <meta name="description" ...>
      description:
        'Неофициальный SDK для работы с API DaData.ru: Полное описание API в типах TypeScript, JSON-schema всех API «Дадаты», полнофункциональный компонент «подсказок» для Vue, и плейграунд чтобы тестировать подсказки в реальном времени.',

      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
          { text: 'OpenAPI', link: '/ru/spec' },
          { text: 'Список API', link: '/ru/api' },
          { text: 'Vue', link: '/ru/vue' },
          { text: 'Демо', link: '/ru/demo' },
        ],

        sidebar: [
          {
            items: [
              { text: 'Демо', link: '/ru/demo' },
              { text: 'Vue компонент', link: '/ru/vue' },
            ],
          },
          {
            items: [{ text: 'Генератор схем', link: '/ru/schema-gen' }],
          },
          {
            text: 'Внешние ссылки',
            collapsed: false,
            items: [
              {
                text: 'GitHub репозиторий',
                link: 'https://github.com/alexchexes/dadata-sdk',
              },
              {
                text: 'JSON-schema',
                link: 'https://github.com/alexchexes/dadata-sdk/tree/rewritten/packages/api-spec/schemas',
              },
              {
                text: 'Ресурсы «Dadata»',
                collapsed: true,
                items: [
                  {
                    text: 'Официальный сайт',
                    link: 'https://dadata.ru/',
                  },
                  {
                    text: 'Ресурсы на Confluence',
                    link: 'https://confluence.hflabs.ru/',
                  },
                  {
                    text: 'Про API',
                    link: 'https://dadata.ru/api/',
                  },
                  {
                    text: 'Все API подсказок',
                    link: 'https://dadata.ru/api/suggest/',
                  },
                  {
                    text: 'Все API стандартизации',
                    link: 'https://dadata.ru/api/clean/',
                  },
                  {
                    text: 'Цены',
                    link: 'https://dadata.ru/pricing/',
                  },
                  {
                    text: 'Техподдержка',
                    link: 'https://support.dadata.ru/',
                  },
                ],
              },
            ],
          },
          {
            text: 'Описание API (OpenAPI)',
            link: '/ru/spec',
            items: [
              {
                text: 'Список сервисов',
                link: '/ru/api',
              },
              ...getSpecSidebar('ru'),
            ],
            collapsed: false,
          },
        ],

        outline: {
          label: 'Содержание',
        },
      },
    },
  },
  transformPageData(pageData) {
    // params returned from [*].paths.js|ts are available here
    const pageTitle = pageData.params?.pageTitle;

    if (pageTitle) {
      pageData.title = pageTitle;
      pageData.frontmatter ??= {};
      pageData.frontmatter.title = pageTitle;
    }
  },
});
