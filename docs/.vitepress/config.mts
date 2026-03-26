import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitepress';

import { getSidebar } from '../utils/getSidebar';

const root = dirname(fileURLToPath(import.meta.url));
const vuePkg = resolve(root, '../../packages/vue-dadata');
const typesPkg = resolve(root, '../../packages/api-types');
const schemaGenPkg = resolve(root, '../../packages/schema-gen');
const [githubOwner, githubRepoName] = process.env.GITHUB_REPOSITORY?.split('/') ?? [];

const isProd = process.env.NODE_ENV === 'production';
const siteBase =
  githubRepoName && githubRepoName !== `${githubOwner}.github.io` ? `/${githubRepoName}/` : '/';

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

  // GitHub project pages are served from /<repo>/ while user pages use /.
  base: siteBase,

  head: [['link', { rel: 'icon', href: `${siteBase}favicon.ico` }]],

  // <meta name="description" ...>
  description:
    'Full API specification in OpenAPI file, TypeScript and JSON-schema, full-featured "suggestions" component for Vue, playground to test "suggestions" API, and more.',

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    socialLinks: [{ icon: 'github', link: 'https://github.com/alexchexes/dadata-sdk' }],
    langMenuLabel: 'Change language | Выбрать язык',
    logo: '/favicon.svg',
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
      label: 'Русский',
      lang: 'ru', // will be added  as `lang` attribute on `html` tag
      link: '/ru/',

      // <meta name="description" ...>
      description:
        'Неофициальный SDK для работы с API DaData.ru: Полное описание API в виде OpenAPI спецификации, JSON-схем и типов TypeScript, полнофункциональный компонент «подсказок» для Vue 3, и плейграунд, чтобы тестировать подсказки в реальном времени',

      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
          { text: 'OpenAPI', link: '/ru/spec' },
          { text: 'Список API', link: '/ru/api' },
          { text: 'Vue', link: '/ru/vue' },
          { text: 'Демо', link: '/ru/demo' },
        ],

        sidebar: [...getSidebar('ru')],

        outline: {
          label: 'Оглавление',
        },
      },
    },
    en: {
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

        sidebar: [...getSidebar('en')],
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
