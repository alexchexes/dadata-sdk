# Dadata SDK

### [README на русском](../README.md)

(Unofficial) tools for working with the DaData API.

**Docs website:** https://alexchexes.github.io/dadata-sdk/
**English docs:** https://alexchexes.github.io/dadata-sdk/en/

## Status

This project started in 2025, before DaData published official OpenAPI schemas. The packages are still useful in practice, but the OpenAPI docs and some contracts need to be synced with the current API. If you want to help, open an issue or PR.

## Packages

- [`packages/api-spec`](../packages/api-spec) (`@dadata-sdk/api-spec`) - OpenAPI and JSON Schema covering nearly the entire public DaData API
- [`packages/api-types`](../packages/api-types) (`@dadata-sdk/api-types`) - TypeScript contracts, constants, and request/response models for the DaData API
- [`packages/vue-dadata`](../packages/vue-dadata) (`@dadata-sdk/vue`) - Vue 3.5+ DaData suggestions component
- [`packages/schema-gen`](../packages/schema-gen) (`@dadata-sdk/schema-gen`) - tool for generating JSON Schema from TypeScript types, using [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator)

## OpenAPI and JSON Schema

Ready-to-use OpenAPI and JSON Schema artifacts live in [`packages/api-spec`](../packages/api-spec):

- [dadata.json](../packages/api-spec/dadata.json)
- [schemas/request.json](../packages/api-spec/schemas/request.json)
- [schemas/response.json](../packages/api-spec/schemas/response.json)

Browse the spec here: https://alexchexes.github.io/dadata-sdk/en/spec

**Complete DaData API index, with links into the OpenAPI pages: https://alexchexes.github.io/dadata-sdk/en/api/**

## TypeScript Contracts

`@dadata-sdk/api-types` contains TypeScript request and response contracts for all public DaData API endpoints, together with shared constants.

## Vue Component

`@dadata-sdk/vue` is a Vue 3.5+ component for DaData suggestions. It supports all major `suggest` endpoints, with the broadest support today around addresses, companies, and banks. The component is fully typed and exposes a wide slot surface for partial or full customization.

- Docs: https://alexchexes.github.io/dadata-sdk/en/vue
- Demo: https://alexchexes.github.io/dadata-sdk/en/demo

**Vue 2** is not supported. If you need the old stack, check earlier versions of [ikloster03/vue-dadata](https://github.com/ikloster03/vue-dadata).

## Credits

These projects were especially useful as references and starting points:

- [DefinitelyTyped/dadata-api](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/dadata-api)
- [vitalybaev/react-dadata](https://github.com/vitalybaev/react-dadata)
- [ikloster03/vue-dadata](https://github.com/ikloster03/vue-dadata)
- [hflabs/suggestions-jquery](https://github.com/hflabs/suggestions-jquery)

## License

MIT

DaData is a trademark of HFLabs.
