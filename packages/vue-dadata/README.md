# @dadata-sdk/vue

## Russian

Vue 3.5+ компонент для DaData Suggestions API.

Лучше всего покрывает сценарии с использованием API адресов (`suggest/address`), но также поддерживает другие `suggest`-эндпоинты DaData. Полностью типизирован. Широкие возможности кастомизации через слоты.

**См. [демо / плейграунд](https://alexchexes.github.io/dadata-sdk/ru/demo).**

### Установка

```bash
npm install @dadata-sdk/vue
```

или

```bash
pnpm i @dadata-sdk/vue
```

### Быстрый старт

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

### Статус

- Неофициальный пакет, часть неофициального «SDK».
- Работает на Vue 3.5+.
- Полезен как есть, но находится в стадии доработки, публичный API ещё не стабилизирован, могут быть существенные изменения между 0.x > 0.y версиями.
- Тесты есть, но покрытие неполное. E2E отсутствует.

### Документация

- Описание компонента: https://alexchexes.github.io/dadata-sdk/ru/vue
- Описание API ДаДаты: https://alexchexes.github.io/dadata-sdk/ru/api/
- Демо/плейграунд: https://alexchexes.github.io/dadata-sdk/ru/demo
- Репозиторий: https://github.com/alexchexes/dadata-sdk/tree/rewritten/packages/vue-dadata

### Связанные пакеты

- [@dadata-sdk/api-types](https://www.npmjs.com/package/@dadata-sdk/api-types) - общие request/response типы, используемые этим пакетом
- [@dadata-sdk/api-spec](https://www.npmjs.com/package/@dadata-sdk/api-spec) - готовые OpenAPI- и JSON Schema-артефакты

---

## English

Vue 3.5+ component for the DaData Suggestions API.

It is strongest for address-related API flows (`suggest/address`), but also supports other DaData `suggest` endpoints. Fully typed. Broad customization via slots.

**See the [demo / playground](https://alexchexes.github.io/dadata-sdk/en/demo).**

### Install

```bash
npm install @dadata-sdk/vue
```

or

```bash
pnpm i @dadata-sdk/vue
```

### Quick Start

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

### Status

- Unofficial package, part of an unofficial SDK.
- Works on Vue 3.5+.
- Useful as-is, but still under active development; the public API is not stabilized yet, so substantial changes between `0.x` and `0.y` versions are possible.
- Tests exist, but coverage is incomplete. No E2E tests yet.

### Documentation

- Component docs: https://alexchexes.github.io/dadata-sdk/en/vue
- DaData API docs: https://alexchexes.github.io/dadata-sdk/en/api/
- Demo / playground: https://alexchexes.github.io/dadata-sdk/en/demo
- Repository: https://github.com/alexchexes/dadata-sdk/tree/rewritten/packages/vue-dadata

### Related Packages

- [@dadata-sdk/api-types](https://www.npmjs.com/package/@dadata-sdk/api-types) - shared request/response contracts used by this package
- [@dadata-sdk/api-spec](https://www.npmjs.com/package/@dadata-sdk/api-spec) - bundled OpenAPI and JSON Schema artifacts

## License

MIT
