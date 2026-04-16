# Dadata SDK

### [English README](en/README.md)

Неофициальный набор инструментов для работы с API DaData.

- **Документация:** https://alexchexes.github.io/dadata-sdk/
- **English docs:** https://alexchexes.github.io/dadata-sdk/en/

## Статус

Проект был начат в 2025 году, до публикации официальных OpenAPI-схем DaData. Пакеты всё также полезны на практике, но OpenAPI документация и часть контрактов требуют синхронизации с актуальным API. Если вы хотите помочь, откройте issue или PR.

## Пакеты

- [`packages/api-spec`](packages/api-spec) (`@dadata-sdk/api-spec`) - OpenAPI и JSON Schema, покрывающая практически весь публичный API Дадаты.
- [`packages/api-types`](packages/api-types) (`@dadata-sdk/api-types`) - TypeScript-типы, константы и модели запросов/ответов для API DaData
- [`packages/vue-dadata`](packages/vue-dadata) (`@dadata-sdk/vue`) - Vue 3.5+ компонент подсказок DaData
- [`packages/schema-gen`](packages/schema-gen) (`@dadata-sdk/schema-gen`) - инструмент для генерации JSON Schema из типов TypeScript (используя [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator)).

## OpenAPI и JSON Schema

Готовые OpenAPI и JSON схемы лежат в [`packages/api-spec`](packages/api-spec):

- [dadata.json](packages/api-spec/dadata.json)
- [schemas/request.json](packages/api-spec/schemas/request.json)
- [schemas/response.json](packages/api-spec/schemas/response.json)

Просмотреть спецификацию можно здесь: https://alexchexes.github.io/dadata-sdk/ru/spec

**Перечень всех API Дадаты, со ссылками к OpenAPI: https://alexchexes.github.io/dadata-sdk/ru/api**

## TypeScript-типы

Пакет `@dadata-sdk/api-types` содержит TypeScript-контракты запросов и ответов всех публичных эндпоинтов API Дадаты, а также константы.

## Vue-компонент

`@dadata-sdk/vue` - компонент DaData-подсказок для Vue 3.5+. Поддерживает все основные `suggest`-эндпоинты, но наиболее широкая поддержка для адресов, организаций, банков. Компонент полностью типизирован. Доступен широкий набор слотов для точечной или полной кастомизации.

- Документация: https://alexchexes.github.io/dadata-sdk/ru/vue
- Демо: https://alexchexes.github.io/dadata-sdk/ru/demo

**Vue 2** не поддерживается. Если нужен старый стек, посмотрите на ранние версии [ikloster03/vue-dadata](https://github.com/ikloster03/vue-dadata).

## Благодарности

Отдельное спасибо этим проектам за идеи и базу, от которой можно было оттолкнуться:

- [DefinitelyTyped/dadata-api](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/dadata-api)
- [vitalybaev/react-dadata](https://github.com/vitalybaev/react-dadata)
- [ikloster03/vue-dadata](https://github.com/ikloster03/vue-dadata)
- [hflabs/suggestions-jquery](https://github.com/hflabs/suggestions-jquery)

## Разработка

Структура моно-репозитория и процесс разработки:

- `packages/api-types` — исходные TypeScript-контракты, константы и модели запросов/ответов.
- `packages/schema-gen` — внутренний генератор JSON Schema из TypeScript-типов.
- `packages/api-spec` — курируемая вручную OpenAPI-основа и сгенерированные API-артефакты.
- `packages/vue-dadata` — Vue-компонент и его типы; часть документации по пропсам строится из этих типов через промежуточную JSON Schema.
- `docs` — VitePress-документация и демо-страницы.
- корневые скрипты — общая точка входа для workspace-сборки, генерации и верификации.

Некоторые файлы, связанные с API-контрактами и документацией, генерируются скриптами и хранятся в репозитории. Они должны оставаться синхронизированными с исходниками. Следующие команды помогают ловить ситуации, когда изменились TypeScript-контракты, курируемая вручную основа OpenAPI-спецификации, типы Vue-компонента или логика генерации, но соответствующие сгенерированные файлы не были обновлены:

- `pnpm gen:api-artifacts` — пересобрать JSON Schema и bundled OpenAPI-артефакты.
- `pnpm docs:gen-vue-schema` — пересобрать JSON Schema, из которой строится документация по пропсам Vue-компонента.
- `pnpm verify:generated` — пересобрать эти артефакты и завершиться с ошибкой, если закоммиченные сгенерированные файлы устарели.

## Лицензия

MIT

DaData - товарный знак HFLabs.
