// import type { Theme } from 'vitepress';
// OpenAPI spec
import { inBrowser } from 'vitepress';
import {
  theme,
  useOpenapi,
  useTheme,
  locales as vitepressOpenApiLocales,
} from 'vitepress-openapi/client';
import 'vitepress-openapi/dist/style.css';
import DefaultTheme from 'vitepress/theme';
import { watch } from 'vue';
import { createI18n } from 'vue-i18n';

import spec from '../../../packages/api-spec/dadata.json';
import locales from '../../locales';
import vitepressOpenApiRu from '../../ru/vitepress-openapi.ru.json';
import { jsDocLinks } from '../../utils/jsDocLinks';

export default {
  extends: DefaultTheme,

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
    const resolveLocale = (path: string) => (/^\/en(\/|$)/.test(path) ? 'en' : 'ru');

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
          md.use(jsDocLinks);
        },
      },
      i18n: {
        locale: initialLocale,
        fallbackLocale: 'en',
        messages: {
          en: vitepressOpenApiLocales.en,
          ru: vitepressOpenApiRu,
        },
        availableLocales: [
          { code: 'en', label: 'English' },
          { code: 'ru', label: 'Русский' },
        ],
      },
    });

    // Update the OpenAPI UI whenever the route (and therefore locale) changes
    watch(
      () => router.route.path,
      (p) => openapiTheme.setI18nConfig({ locale: resolveLocale(p) }),
    );

    theme.enhanceApp(ctx);

    const i18n = createI18n({
      legacy: false,
      locale: initialLocale,
      fallbackLocale: 'en',
      missingWarn: false,
      fallbackRoot: false,
      messages: locales,
    });
    ctx.app.use(i18n);
  },
} /* satisfies Theme */;
