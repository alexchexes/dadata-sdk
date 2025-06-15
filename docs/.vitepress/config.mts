import { defineConfig } from 'vitepress';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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
      link: '/',

      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
          { text: 'Home', link: '/' },
          { text: 'API endpoints', link: '/endpoints' },
          { text: 'Demo', link: '/demo' },
        ],

        sidebar: [
          {
            items: [
              { text: 'API endpoints', link: '/endpoints' },
              { text: 'Demo', link: '/demo' },
              { text: 'Schema generator', link: '/schema-gen' },
            ],
          },
          {
            text: 'External links',
            items: [
              { text: 'GitHub Repo', link: 'https://github.com/alexchexes/dadata-sdk' },
              {
                text: 'JSON-schema',
                link: 'https://github.com/alexchexes/dadata-sdk/tree/rewritten/packages/api-types/json-schema',
              },
            ],
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
          { text: 'Главная', link: '/ru/' },
          { text: 'Список API', link: '/ru/endpoints' },
          { text: 'Демо', link: '/ru/demo' },
        ],

        sidebar: [
          {
            items: [
              { text: 'Список API «Дадаты»', link: '/ru/endpoints' },
              { text: 'Демо', link: '/ru/demo' },
              { text: 'Генератор схем', link: '/ru/schema-gen' },
            ],
          },
          {
            text: 'Внешние ссылки',
            items: [
              { text: 'GitHub Repo', link: 'https://github.com/alexchexes/dadata-sdk' },
              {
                text: 'JSON-schema',
                link: 'https://github.com/alexchexes/dadata-sdk/tree/rewritten/packages/api-types/json-schema',
              },
            ],
          },
        ],

        outline: {
          label: 'Содержание',
        },
      },
    },
  },
});
