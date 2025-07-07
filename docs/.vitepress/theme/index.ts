import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';

// Demo-page
import { createI18n } from 'vue-i18n';
import messages from '../../locales';

// OpenAPI spec
import { theme as openApiTheme, useOpenapi } from 'vitepress-openapi/client';
import 'vitepress-openapi/dist/style.css';
import spec from '../../../packages/api-spec/dadata.json';

export default {
  extends: DefaultTheme,

  async enhanceApp(ctx) {
    useOpenapi({ spec: spec });

    openApiTheme.enhanceApp(ctx);

    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      fallbackLocale: 'en',
      messages,
      missingWarn: false,
    });
    ctx.app.use(i18n);
  },
} satisfies Theme;
