import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitepress';
import { useSidebar } from 'vitepress-openapi';

import spec from '../../packages/api-spec/dadata.json';

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

// OpenAPI
const sidebar = useSidebar({
  spec: spec as any,
  // Optionally, you can specify a link prefix for all generated sidebar items.
  linkPrefix: '/operations/',
});

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
          { text: 'Demo', link: '/en/demo' },
          { text: 'Vue', link: '/en/vue' },
          { text: 'API endpoints', link: '/en/endpoints' },
        ],

        sidebar: [
          {
            items: [
              { text: 'Demo', link: '/en/demo' },
              { text: 'API endpoints', link: '/en/endpoints' },
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
                link: 'https://github.com/alexchexes/dadata-sdk/tree/rewritten/packages/api-types/json-schema',
              },
            ],
          },
          {
            items: [
              {
                text: 'OpenAPI spec',
                link: '/en/spec',
              },
            ],
          },
          {
            text: 'By Tags',
            items: [...sidebar.itemsByTags({ linkPrefix: '/en/tags/' })],
          },
          {
            text: 'By Operations',
            items: [
              ...sidebar.generateSidebarGroups({ linkPrefix: '/en/operations/' }).map((group) => ({
                ...group,
                collapsed: true,
              })),
            ],
          },
          {
            text: 'By Paths',
            items: [
              ...sidebar.itemsByPaths({ linkPrefix: '/en/operations/' }).map((group) => ({
                ...group,
                items: group.items?.map((g) => ({
                  ...g,
                  collapsed: true,
                })),
                collapsed: true,
              })),
            ],
          },
          {
            text: 'One Page',
            items: [
              { text: 'One Page', link: '/en/one-page' },
              { text: 'Without Sidebar', link: '/en/without-sidebar' },
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
          { text: 'Демо', link: '/ru/demo' },
          { text: 'Vue', link: '/ru/vue' },
          { text: 'Список API', link: '/ru/endpoints' },
        ],

        sidebar: [
          {
            items: [
              { text: 'Демо', link: '/ru/demo' },
              { text: 'Список API «Дадаты»', link: '/ru/endpoints' },
              { text: 'Vue компонент', link: '/ru/vue' },
            ],
          },
          {
            items: [{ text: 'Генератор схем', link: '/ru/schema-gen' }],
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
          {
            items: [
              {
                text: 'OpenAPI спецификация',
                link: '/ru/spec',
              },
            ],
          },
          {
            text: 'Теги',
            items: [...sidebar.itemsByTags({ linkPrefix: '/ru/tags/' })],
          },
          {
            text: 'Группировка по тегам',
            items: [
              ...sidebar.generateSidebarGroups({ linkPrefix: '/ru/operations/' }).map((group) => ({
                ...group,
                collapsed: true,
              })),
            ],
          },
          {
            text: 'По URL',
            items: [
              ...sidebar.itemsByPaths({ linkPrefix: '/ru/operations/' }).map((group) => ({
                ...group,
                items: group.items?.map((g) => ({
                  ...g,
                  collapsed: true,
                })),
                collapsed: true,
              })),
            ],
          },
          {
            text: 'Всё на одной странице',
            items: [
              { text: 'Одна страница', link: '/en/one-page' },
              { text: 'Без меню', link: '/en/without-sidebar' },
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
