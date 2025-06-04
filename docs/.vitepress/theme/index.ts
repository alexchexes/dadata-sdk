import DefaultTheme from 'vitepress/theme';
import { createI18n } from 'vue-i18n';
import '../../demopage/demopage.css';
import messages from '../../locales';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      fallbackLocale: 'en',
      messages,
      missingWarn: false,
    });
    app.use(i18n);
  },
};
