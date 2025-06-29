# Dadata SDK

### [README in English](../README.md)

### [Docs website](../docs/ru/index.md) (not hosted yet)

## JSON-схемы

Полное описание контракта API «Дадаты» в формате JSON-schema:

- [Request.json](packages/api-types/json-schema/request.json)
- [Response.json](packages/api-types/json-schema/response.json)

Аккуратно сгенерировано из типов TypeScript (см. ниже ↓).

## Типы TypeScript

`@dadata-sdk/api-types`

Библиотека типов TypeScript, подробно документирующая все API Дадаты (типы для запросов и ответов для всех API) с полной экспортируемостью и подробной JSDoc документацией.

_Начать помогли эти библиотеки:_

> - _[DefinitelyTyped/dadata-api](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/dadata-api)_
> - _[vitalybaev/react-dadata](https://github.com/vitalybaev/react-dadata)_
> - _[ikloster03/vue-dadata](https://github.com/ikloster03/vue-dadata)_

## Компонент для Vue

`@dadata-sdk/vue`

Компонент подсказок [DaData.ru](https://dadata.ru) для Vue 3, поддерживающий адреса, организации (РФ / КЗ / РБ), банки и все остальные API.

### [Документация](../docs/ru/vue.md)     [Демо](../docs/ru/demo.md)

**Vue 2** не поддерживается. Возможно, вам пригодится одна из старых версий [ikloster03/vue-dadata](https://github.com/ikloster03/vue-dadata).

_На чёт основано / вдохновлено:_

> - _[ikloster03/vue-dadata](https://github.com/ikloster03/vue-dadata) by Ivan Monastyrev_
> - _[vitalybaev/react-dadata](https://github.com/vitalybaev/react-dadata) (отдельные идеи и приёмы)_
> - _[hflabs/suggestions-jquery](https://github.com/hflabs/suggestions-jquery) (официальный jQuery-плагин)_

## Утилиты

`@dadata-sdk/schema-gen` — [Генератор JSON-схем из TypeScript](../docs/ru/schema-gen.md)

## Лицензия

MIT

DaData — товарный знак HFLabs.
