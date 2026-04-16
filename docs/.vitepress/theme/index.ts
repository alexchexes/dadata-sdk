import { inBrowser } from 'vitepress';
import {
  theme,
  useOpenapi,
  useTheme,
  locales as vitepressOpenApiLocales,
} from 'vitepress-openapi/client';
import DefaultTheme from 'vitepress/theme';
import { defineComponent, Fragment, h, watch } from 'vue';
import { createI18n } from 'vue-i18n';

import { YANDEX_METRIKA_COUNTER_ID } from '../metrika';
import spec from '../../../packages/api-spec/dadata.json';
import vpOpenApiLocalesRu from '../../locale-vp-openapi.ru.json';
import specLocales from '../../locales-spec';
import { jsDocLinks } from '../../utils/jsDocLinks';
import 'vitepress-openapi/dist/style.css';
import './style.css';

const openApiMessages = {
  en: {
    ...vitepressOpenApiLocales.en,
    'const:': 'const:',
  },
  ru: {
    // Inherit upstream English keys so untranslated additions do not warn during SSR.
    ...vitepressOpenApiLocales.en,
    ...vpOpenApiLocalesRu,
  },
} as const;

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

const metrikaEnabled = import.meta.env.PROD;

const ThemeLayout = defineComponent({
  name: 'DocsThemeLayout',
  setup() {
    return () =>
      h(Fragment, [
        h(DefaultTheme.Layout),
        metrikaEnabled
          ? h('noscript', [
              h('div', [
                h('img', {
                  src: `https://mc.yandex.ru/watch/${YANDEX_METRIKA_COUNTER_ID}`,
                  style: 'position:absolute; left:-9999px;',
                  alt: '',
                }),
              ]),
            ])
          : null,
      ]);
  },
});

function toTrackedUrl(source?: string) {
  const url = source ? new URL(source, window.location.origin) : new URL(window.location.href);

  url.hash = '';

  return url.href;
}

export default {
  extends: DefaultTheme,
  Layout: ThemeLayout,

  async enhanceApp(ctx) {
    useOpenapi({
      spec: spec as any,
      config: {
        server: {
          allowCustomServer: true,
        },
      },
    });

    const { router } = ctx;

    // Helper to map a path to our two supported locales
    const resolveLocale = (path: string) => (/^\/(?:[^\/]+\/)?en(\/|$)/.test(path) ? 'en' : 'ru');

    const initialLocale = inBrowser
      ? resolveLocale(window.location.pathname)
      : resolveLocale(router.route.path);

    // keep a handle so we can change locale later
    const openapiTheme = useTheme({
      requestBody: {
        // Set the default schema view.
        defaultView: 'schema', // schema or contentType
      },
      jsonViewer: {
        renderer: 'shiki',
      },
      schemaViewer: {
        deep: 2,
      },
      response: {
        responseCodeSelector: 'tabs',
        maxTabs: 10,
        body: {
          defaultView: 'schema', // schema or contentType
        },
      },
      operation: {
        cols: 1,
      },
      markdown: {
        externalLinksNewTab: true,
        config: (md): undefined => {
          md.use(jsDocLinks, initialLocale);
        },
      },
      i18n: {
        locale: initialLocale,
        fallbackLocale: 'en',
        messages: openApiMessages,
        availableLocales: [
          { code: 'en', label: 'English' },
          { code: 'ru', label: 'Русский' },
        ],
      },
    });

    // Update the OpenAPI UI whenever the route (and therefore locale) changes
    watch(
      () => router.route.path,
      (path) => {
        openapiTheme.setI18nConfig({ locale: resolveLocale(path) });
        openapiTheme.setMarkdownConfig({
          config: (md): undefined => {
            md.use(jsDocLinks, resolveLocale(path));
          },
        });
      },
    );

    theme.enhanceApp(ctx);

    if (inBrowser && metrikaEnabled) {
      let lastTrackedUrl = '';

      const trackPageView = (source?: string) => {
        const ym = window.ym;

        if (!ym) {
          return;
        }

        const url = toTrackedUrl(source);

        if (url === lastTrackedUrl) {
          return;
        }

        const referer = lastTrackedUrl || document.referrer;

        ym(YANDEX_METRIKA_COUNTER_ID, 'hit', url, {
          title: document.title,
          ...(referer ? { referer } : {}),
        });

        lastTrackedUrl = url;
      };

      const previousOnAfterRouteChange = router.onAfterRouteChange;

      router.onAfterRouteChange = async (to) => {
        await previousOnAfterRouteChange?.(to);
        requestAnimationFrame(() => {
          trackPageView(to);
        });
      };

      requestAnimationFrame(() => {
        trackPageView();
      });
    }

    const i18n = createI18n({
      legacy: false,
      locale: initialLocale,
      fallbackLocale: 'en',
      missingWarn: false,
      fallbackRoot: false,
      messages: specLocales,
    });
    ctx.app.use(i18n);
  },
};
