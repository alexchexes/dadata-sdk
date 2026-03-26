# @dadata-sdk/api-spec

Bundled OpenAPI and JSON Schema artifacts for the DaData API.

This package is intended for projects that want the generated OpenAPI/JSON Schema outputs directly, without pulling in the Vue component or the TypeScript contract package.

## Install

```bash
npm install @dadata-sdk/api-spec
```

```bash
pnpm add @dadata-sdk/api-spec
```

## Included Files

- `dadata.json` - bundled OpenAPI document used by this monorepo
- `schemas/request.json` - generated request JSON Schema bundle
- `schemas/response.json` - generated response JSON Schema bundle

## Usage

```ts
import requestSchema from '@dadata-sdk/api-spec/schemas/request.json' with { type: 'json' };
import responseSchema from '@dadata-sdk/api-spec/schemas/response.json' with { type: 'json' };
```

## Documentation

- Spec docs: https://alexchexes.github.io/dadata-sdk/en/spec
- Repository: https://github.com/alexchexes/dadata-sdk/tree/rewritten/packages/api-spec

## License

MIT
