# Dadata SDK

### [README in Russian](ru/README.md)

**[Docs website](docs/index.md) (not hosted yet)**

## OpenAPI spec

## JSON-schema

Full Dadata API contract described as JSON Schema:

- [Request.json](packages/api-types/json-schema/request.json)
- [Response.json](packages/api-types/json-schema/response.json)

Carefully generated from the TypeScript types (see below ↓).

## TypeScript types

`@dadata-sdk/api-types`

Hand-crafted, fully exported, JSDoc-documented TypeScript types library for all request and response models for each Dadata API endpoint.

_Thanks for the kickstart to:_

> - _[DefinitelyTyped/dadata-api](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/dadata-api)_
> - _[vitalybaev/react-dadata](https://github.com/vitalybaev/react-dadata)_
> - _[ikloster03/vue-dadata](https://github.com/ikloster03/vue-dadata)_

## Vue component

`@dadata-sdk/vue`

[DaData.ru](https://dadata.ru) suggestion component for Vue 3 — addresses, organizations (RU / KZ / BY), banks, and every other `suggest` API endpoint (all of them!).

### [Documentation](docs/vue.md) &nbsp;&nbsp;&nbsp; [Demo](docs/demo.md)

**Vue 2** is not supported, though you can check the old versions of [ikloster03/vue-dadata](https://github.com/ikloster03/vue-dadata).

_Based on / inspired by:_

> - _[ikloster03/vue-dadata](https://github.com/ikloster03/vue-dadata) by Ivan Monastyrev._
> - _[vitalybaev/react-dadata](https://github.com/vitalybaev/react-dadata) (some techniques and ideas)_
> - _[hflabs/suggestions-jquery](https://github.com/hflabs/suggestions-jquery) (official jQuery plugin)_

## Utils

`@dadata-sdk/schema-gen` - [TypeScript to JSON-schema generator](docs/schema-gen.md)

## License

MIT

DaData is a trademark of HFLabs.
