# @dadata-sdk/api-spec

## Russian

Готовые OpenAPI- и JSON схемы для DaData API с детальной документацией объектов.

Сгенерированы из [TypeScript типов](https://www.npmjs.com/package/@dadata-sdk/api-types).

- OpenAPI `3.1`.
- JSON Schema `draft-07`.

### Установка

```bash
npm install @dadata-sdk/api-spec
```

или

```bash
pnpm i @dadata-sdk/api-spec
```

### Содержимое пакета

- `dadata.json` - Собранный OpenAPI `3.1` с описанием всех публичных эндпоинтов «Дадаты»
- `schemas/request.json` - JSON-Schema `draft-07`, описывающая объекты, используемые в **запросах** к API «Дадаты»
- `schemas/response.json` - JSON-Schema `draft-07`, описывающая объекты, используемые в **ответах** от API «Дадаты»

### Использование

В зависимости от цели.

Если вы хотите сгенерировать API-клиент на вашем языке программирования из OpenAPI схемы, вам так или иначе понадобится `OpenAPI->Ваш язык` генератор, возможные опции:

- https://github.com/OpenAPITools/openapi-generator - универсальный
- https://github.com/janephp/janephp - PHP
- см. https://www.reddit.com/r/PHP/comments/11ut5ms/openapigenerator_vs_janephp/

Если вы хотите только сгенерировать DTO из JSON-схем, а код API-клиента у вас собственный, вы можете это сделать используя:

- https://github.com/alexchexes/php-schema2class - PHP

#### Прямой импорт в качестве ES модуля:

```ts
import requestSchema from '@dadata-sdk/api-spec/schemas/request.json' with { type: 'json' };
import responseSchema from '@dadata-sdk/api-spec/schemas/response.json' with { type: 'json' };
```

### Статус

- Неофициальный пакет, часть неофициального «SDK».
- Схемы полезны как есть, но находятся в стадии доработки.
- Структура ещё не стабилизирована, могут быть заметные изменения между `0.x` > `0.y` версиями.

### Документация

- Описание спецификации и схем: https://alexchexes.github.io/dadata-sdk/ru/spec
- Описание API и эндпоинтов: https://alexchexes.github.io/dadata-sdk/ru/api/
- Репозиторий: https://github.com/alexchexes/dadata-sdk/tree/rewritten/packages/api-spec

### Связанные пакеты

- [@dadata-sdk/api-types](https://www.npmjs.com/package/@dadata-sdk/api-types) - TypeScript-типы запросов и ответов для DaData API, из которых сгенерированы данные схемы
- [@dadata-sdk/vue](https://www.npmjs.com/package/@dadata-sdk/vue) - Vue 3.5+ компонент подсказок

---

## English

Bundled OpenAPI and JSON Schema artifacts for the DaData API, with detailed object documentation.

Generated from [TypeScript types](https://www.npmjs.com/package/@dadata-sdk/api-types).

- OpenAPI `3.1`.
- JSON Schema `draft-07`.

### Install

```bash
npm install @dadata-sdk/api-spec
```

or

```bash
pnpm i @dadata-sdk/api-spec
```

### Included Files

- `dadata.json` - bundled OpenAPI `3.1` document describing all public DaData endpoints
- `schemas/request.json` - JSON Schema `draft-07` describing objects used in **requests** to the DaData API
- `schemas/response.json` - JSON Schema `draft-07` describing objects used in **responses** from the DaData API

### Usage

Depending on your goal.

If you want to generate an API client in your language from the OpenAPI spec, you will need an `OpenAPI -> your language` generator. Possible options:

- https://github.com/OpenAPITools/openapi-generator - general-purpose
- https://github.com/janephp/janephp - PHP
- see https://www.reddit.com/r/PHP/comments/11ut5ms/openapigenerator_vs_janephp/

If you only want to generate DTOs from the JSON Schemas and your API client code is custom, you can do that with:

- https://github.com/alexchexes/php-schema2class - PHP

#### Direct import as an ES module

```ts
import requestSchema from '@dadata-sdk/api-spec/schemas/request.json' with { type: 'json' };
import responseSchema from '@dadata-sdk/api-spec/schemas/response.json' with { type: 'json' };
```

### Documentation

- Spec and schema docs: https://alexchexes.github.io/dadata-sdk/en/spec
- API and endpoints docs: https://alexchexes.github.io/dadata-sdk/en/api/
- Repository: https://github.com/alexchexes/dadata-sdk/tree/rewritten/packages/api-spec

### Related Packages

- [@dadata-sdk/api-types](https://www.npmjs.com/package/@dadata-sdk/api-types) - TypeScript request and response types for the DaData API, from which these schema artifacts are generated
- [@dadata-sdk/vue](https://www.npmjs.com/package/@dadata-sdk/vue) - Vue 3.5+ suggestions component

## License

MIT
