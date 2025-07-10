// import type { Theme } from 'vitepress';
// OpenAPI spec
import { inBrowser } from 'vitepress';
import { locales, theme, useOpenapi, useTheme } from 'vitepress-openapi/client';
import 'vitepress-openapi/dist/style.css';
import DefaultTheme from 'vitepress/theme';
import { watch } from 'vue';
import { createI18n } from 'vue-i18n';

import spec from '../../../packages/api-spec/dadata.json';
import demopageMessages from '../../demopage/locales';
import vitepressOpenApiRu from '../../ru/vitepress-openapi.ru.json';

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
      },
      i18n: {
        locale: initialLocale,
        fallbackLocale: 'en',
        messages: {
          en: locales.en,
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
      messages: demopageMessages,
      missingWarn: false,
    });
    ctx.app.use(i18n);
  },
} /* satisfies Theme */;
