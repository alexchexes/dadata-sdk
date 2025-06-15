---
outline: deep
---

# `@dadata-sdk/schema-gen`

A small tool to generate JSON Schema files from TypeScript definitions.

## Usage

```bash
pnpm schema-gen --input path/to/file.types.ts --output ./json-schema
```

Programmatic API:

```ts
import { generateSchemas } from '@dadata-sdk/schema-gen'

await generateSchemas({
  inputDirOrFile: 'src/types',
  outputDir: 'json-schema',
  tsconfigPath: 'tsconfig.json'
})
```
