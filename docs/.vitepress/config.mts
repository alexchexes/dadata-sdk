import { defineConfig } from 'vitepress';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const vuePkg = resolve(root, '../../packages/vue-dadata');
const typesPkg = resolve(root, '../../packages/api-types');

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
};

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'DaData SDK',

  // <meta name="description" ...>
  description:
    'Unofficial DaData (dadata.ru) SDK; TypeScript types, Vue component, rich API playground and docs.',

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
            text: 'Examples',
            items: [
              { text: 'Markdown Examples', link: '/markdown-examples' },
              { text: 'Runtime API Examples', link: '/api-examples' },
            ],
          },
          {
            items: [{ text: 'API endpoints', link: '/endpoints' }],
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
        'Неофициальный DaData (dadata.ru) SDK; TypeScript types, Vue component, rich API playground and docs.',

      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
          { text: 'Главная', link: '/ru' },
          { text: 'Список API', link: '/ru/endpoints' },
          { text: 'Демо', link: '/ru/demo' },
        ],

        sidebar: [
          {
            text: 'Примеры',
            items: [
              { text: 'Примеры Markdown', link: '/ru/markdown-examples' },
              { text: 'Пример Runtime API', link: '/ru/api-examples' },
            ],
          },
          {
            items: [{ text: 'Список API', link: '/ru/endpoints' }],
          },
        ],

        outline: {
          label: 'Содержание',
        },
      },
    },
  },
});
