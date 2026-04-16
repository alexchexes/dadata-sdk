# @dadata-sdk/api-types

## Russian

TypeScript-типы для запросов и ответов всех эндпоинтов API «Дадаты» с детальной JSDoc документацией на русском языке.

Содержит написанные вручную модели запросов и ответов, **константы** и прочие связанные с эндпоинтами типы.

### Установка

```bash
npm install @dadata-sdk/api-types
```

или

```bash
pnpm i @dadata-sdk/api-types
```

### Пример использования

```ts
import type { AddressSuggestion, SuggestAddressPayload } from '@dadata-sdk/api-types';
import { BASE_SUGGEST_URL, SUGGEST_TYPES } from '@dadata-sdk/api-types';
```

### Статус

- Неофициальный пакет, часть неофициального «SDK».
- Типы полезны как есть, но находятся в стадии доработки.
- Структура ещё не стабилизирована, могут быть заметные изменения между `0.x` > `0.y` версиями.

### Документация

- Описание спецификации и схем: https://alexchexes.github.io/dadata-sdk/ru/spec
- Описание API и эндпоинтов: https://alexchexes.github.io/dadata-sdk/ru/api/
- Репозиторий: https://github.com/alexchexes/dadata-sdk/tree/rewritten/packages/api-types

### Связанные пакеты

- [@dadata-sdk/api-spec](https://www.npmjs.com/package/@dadata-sdk/api-spec) - готовые OpenAPI- и JSON Schema-артефакты
- [@dadata-sdk/vue](https://www.npmjs.com/package/@dadata-sdk/vue) - Vue 3.5+ компонент подсказок, использующий эти типы

---

## English

TypeScript types for requests and responses of all DaData API endpoints, with detailed JSDoc documentation in Russian.

Contains hand-crafted request and response models, **constants**, and other endpoint-related types.

### Install

```bash
npm install @dadata-sdk/api-types
```

or

```bash
pnpm i @dadata-sdk/api-types
```

### Usage Example

```ts
import type { AddressSuggestion, SuggestAddressPayload } from '@dadata-sdk/api-types';
import { BASE_SUGGEST_URL, SUGGEST_TYPES } from '@dadata-sdk/api-types';
```

### Status

- Unofficial package, part of an unofficial SDK.
- The types are already useful as-is, but the package is still being refined.
- The structure is not stabilized yet, so noticeable changes between `0.x` and `0.y` versions are possible.

### Documentation

- Spec and schema docs: https://alexchexes.github.io/dadata-sdk/en/spec
- API and endpoints docs: https://alexchexes.github.io/dadata-sdk/en/api/
- Repository: https://github.com/alexchexes/dadata-sdk/tree/rewritten/packages/api-types

### Related Packages

- [@dadata-sdk/api-spec](https://www.npmjs.com/package/@dadata-sdk/api-spec) - bundled OpenAPI and JSON Schema artifacts
- [@dadata-sdk/vue](https://www.npmjs.com/package/@dadata-sdk/vue) - Vue 3.5+ suggestions component built on top of these contracts

## License

MIT
