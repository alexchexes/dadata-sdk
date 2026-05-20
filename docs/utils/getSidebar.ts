import { getSpecSidebar } from './getSpecSidebar';

export function getSidebar(lang: 'ru' | 'en') {
  const t = (ru: string, en: string) => {
    return lang === 'en' ? en : ru;
  };

  return [
    {
      items: [
        { text: t('Демо', 'Demo'), link: `/${lang}/demo` },
        { text: t('Vue компонент', 'Vue component'), link: `/${lang}/vue` },
      ],
    },
    {
      items: [{ text: t('Генератор схем', 'Schema generator'), link: `/${lang}/schema-gen` }],
    },
    {
      text: t('Внешние ссылки', 'External links'),
      collapsed: false,
      items: [
        {
          text: t('GitHub репозиторий', 'GitHub Repo'),
          link: 'https://github.com/alexchexes/dadata-sdk',
        },
        {
          text: 'JSON-schema',
          link: 'https://github.com/alexchexes/dadata-sdk/tree/rewritten/packages/api-spec/schemas',
        },
        {
          text: t('Ресурсы «Dadata»', 'Official resources'),
          collapsed: true,
          items: [
            {
              text: t('Официальный сайт', 'DaData.ru site'),
              link: 'https://dadata.ru/',
            },
            {
              text: t('Ресурсы на Confluence', 'Confluence spaces'),
              link: 'https://confluence.hflabs.ru/',
            },
            {
              text: t('Про API', 'About DaData API'),
              link: 'https://dadata.ru/api/',
            },
            {
              text: t('Способы интеграции «Подсказок»', 'Suggestions Integration'),
              link: 'https://dadata.ru/suggestions/usage/',
            },
            {
              text: t('Все API подсказок', "All 'suggest' endpoints"),
              link: 'https://dadata.ru/api/suggest/',
            },
            {
              text: t('Все API стандартизации', "All 'clean' endpoints"),
              link: 'https://dadata.ru/api/clean/',
            },
            {
              text: t('«Руководство по эксплуатации» (PDF)', '"Manual" (legal document), PDF'),
              link: 'https://dadata.ru/files/documents/Руководство_по_эксплуатации_DaData.pdf',
            },
            {
              text: t('Цены', 'Pricing'),
              link: 'https://dadata.ru/pricing/',
            },
            {
              text: t('Техподдержка', 'Support'),
              link: 'https://support.dadata.ru/',
            },
          ],
        },
      ],
    },
    {
      text: t('Описание API (OpenAPI)', 'OpenAPI spec'),
      link: `/${lang}/spec`,
      items: [
        {
          text: t('Список сервисов', 'List of APIs'),
          link: `/${lang}/api/`,
        },
        ...getSpecSidebar(lang),
      ],
      collapsed: false,
    },
  ];
}
