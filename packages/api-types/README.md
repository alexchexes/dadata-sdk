# @dadata-sdk/api-types

TypeScript request and response contracts for the DaData API.

This package contains the hand-crafted request/response models, constants, and endpoint-related types used by the monorepo and by consumer projects that want typed access to DaData payloads without pulling in the Vue component.

## Install

```bash
npm install @dadata-sdk/api-types
```

```bash
pnpm add @dadata-sdk/api-types
```

## Usage

```ts
import type { AddressSuggestion, SuggestAddressPayload } from '@dadata-sdk/api-types';
import { BASE_SUGGEST_URL, SUGGEST_TYPES } from '@dadata-sdk/api-types';
```

## Related Packages

- `@dadata-sdk/api-spec` - bundled OpenAPI and JSON Schema artifacts
- `@dadata-sdk/vue` - Vue 3.5+ suggestions component built on top of these contracts

## Documentation

- Spec docs: https://alexchexes.github.io/dadata-sdk/en/spec
- API endpoints docs: https://alexchexes.github.io/dadata-sdk/en/api
- Repository: https://github.com/alexchexes/dadata-sdk/tree/rewritten/packages/api-types

## License

MIT
