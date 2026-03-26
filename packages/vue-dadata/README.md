# @dadata-sdk/vue

Unofficial Vue 3.5+ component for the DaData suggestions API.

It is strongest today for the most common `suggest/address` flow, but it also exposes broader support for other DaData `suggest` endpoints, typed request options, slot customization, and a live demo/playground.

## Install

```bash
npm install @dadata-sdk/vue
```

```bash
pnpm add @dadata-sdk/vue
```

## Quick Start

```vue
<script setup lang="ts">
import { VueDadata } from '@dadata-sdk/vue';
import '@dadata-sdk/vue/dist/vue-dadata.css';
import { ref } from 'vue';

const query = ref('');
</script>

<template>
  <VueDadata v-model="query" token="your-dadata-token" />
</template>
```

## Status

- Unofficial package.
- Vue 3.5+ only.
- Useful now, but still under active hardening.
- Tests exist, but coverage is still incomplete.

## Documentation

- Docs: https://alexchexes.github.io/dadata-sdk/en/vue
- Demo: https://alexchexes.github.io/dadata-sdk/en/demo
- Repository: https://github.com/alexchexes/dadata-sdk/tree/rewritten/packages/vue-dadata

## Related Packages

- `@dadata-sdk/api-types` - shared request/response contracts used by this package
- `@dadata-sdk/api-spec` - bundled OpenAPI and JSON Schema artifacts

## License

MIT
