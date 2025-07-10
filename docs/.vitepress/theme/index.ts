// import type { Theme } from 'vitepress';
// OpenAPI spec
import { locales, theme, useOpenapi, useTheme } from 'vitepress-openapi/client';
import 'vitepress-openapi/dist/style.css';
import DefaultTheme from 'vitepress/theme';
import { createI18n } from 'vue-i18n';

import spec from '../../../packages/api-spec/dadata.json';
import messages from '../../locales';

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

    useTheme({
      requestBody: {
        // Set the default schema view.
        defaultView: 'schema', // schema or contentType
      },
      response: {
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
        locale: 'ru',
        fallbackLocale: 'en',
        messages: {
          en: locales.en,
          ru: {
            'Response': 'Ответ',
            'Responses': 'Ответы API',
            'Request Body': 'Тело ответа',
            'Authorizations': 'Авторизация',
            'Authorization': 'Авторизация',

            'Operations': 'Операции',
            'Default': 'По умолчанию',
            'Example': 'Пример',
            'Examples': 'Примеры',
            'Samples': 'Как вызвать',
            'Playground': 'Песочница',
            'Server': 'Сервер',
            'Body': 'Запрос',
          },
        },
        availableLocales: [
          { code: 'en', label: 'English' },
          { code: 'ru', label: 'Русский' },
        ],
      },
    });

    theme.enhanceApp(ctx);

    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      fallbackLocale: 'en',
      messages,
      missingWarn: false,
    });
    ctx.app.use(i18n);
  },
} /* satisfies Theme */;
