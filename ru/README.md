# Dadata SDK

### [README in English](../README.md)

### [Docs website](../docs/ru/index.md) (not hosted yet)

## OpenAPI спецификация API «Дадаты»

Спецификация в формате [OpenAPI](https://www.openapis.org/) 3.1, описывающая все API эндпоинты «Дадаты»:

- https://github.com/alexchexes/dadata-sdk/blob/openapi-vitepress/packages/api-spec/dadata.json

## JSON-схемы

JSON-schema всех объектов, используемых в запросах и ответах API «Дадаты»:

- [Request.json](packages/api-types/json-schema/request.json)
- [Response.json](packages/api-types/json-schema/response.json)

Аккуратно сгенерировано из [типов TypeScript](#типы-typescript).

Пригодно для генерации моделей на любых языках программирования. _[Пример утилиты для генерации PHP-классов](https://github.com/alexchexes/php-schema2class)_.

## Типы TypeScript

`@dadata-sdk/api-types`

Библиотека типов TypeScript с описанием всех объектов, используемых в запросах и ответах API «Дадаты» с подробной JSDoc документацией для каждого поля.

_Начать работу помогли эти пакеты:_

> - _[DefinitelyTyped/dadata-api](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/dadata-api)_
> - _[vitalybaev/react-dadata](https://github.com/vitalybaev/react-dadata)_
> - _[ikloster03/vue-dadata](https://github.com/ikloster03/vue-dadata)_

## Компонент для Vue

`@dadata-sdk/vue`

Компонент подсказок [DaData.ru](https://dadata.ru) для Vue 3, поддерживающий адреса, организации (РФ / КЗ / РБ), банки и все остальные типы подсказок Дадаты.

### [Документация](../docs/ru/vue.md)   |   [Демо](../docs/ru/demo.md)

**Vue 2** не поддерживается. Если вы не можете [обновиться до Vue 3](https://v3-migration.vuejs.org/), возможно, вам пригодится одна из старых версий этого пакета: [ikloster03/vue-dadata](https://github.com/ikloster03/vue-dadata).

_Спасибо авторам этих пакетов за вдохновление и идеи:_

> - _[ikloster03/vue-dadata](https://github.com/ikloster03/vue-dadata) by Ivan Monastyrev_
> - _[vitalybaev/react-dadata](https://github.com/vitalybaev/react-dadata) by Vitaly Baev_
> - _[официальный jQuery-плагин](https://github.com/hflabs/suggestions-jquery)_

## Утилиты

`@dadata-sdk/schema-gen` — [Генератор JSON-схем из TypeScript](../docs/ru/schema-gen.md)

## TODO:

### Функционал:

- Возможность предоставить собственный http-кеш, а также забрать кеш сделанных на клиенте запросов

### Разработка:

- E2E-тесты (mock API)
- Интеграционные тесты с вызовами реального API и AJV валидацией ответов
- Выделить типизированную API-обёртку в отдельный субпакет
- Рефакторинг SFC демо-страницы `demopage.vue`

## Лицензия

MIT

DaData — товарный знак HFLabs.
