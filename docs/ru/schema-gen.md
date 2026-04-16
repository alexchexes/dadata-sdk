# Генератор JSON-schema из типов TypeScript

`@dadata-sdk/schema-gen`

Утилита для генерации JSON-schema из типов TypeScript.

Представляет собой обёртку над [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator), настроенную под нужды данного проекта и улучшенную за счёт нескольких дополнительных проходов пост-обработки.

Обрабатывает схему таким образом, чтобы из неё было легче генерировать осмысленный код на других языках программирования, например, через такие инструменты как: [PHP Schema2Class](https://github.com/martin-helmich/php-schema2class) ([рабочий форк](https://github.com/alexchexes/php-schema2class)).

- Убирает из схемы артефакты наподобие `Partial<alias-5732195...>`.
- Схлопывает цепочки ссылающихся друг на друга generic-ов, оставляя только основной definition.
- Встраивает любые definitions верхнего уровня, с типом, отличным от `object`, в то место, где они используются.

Также подойдёт, например, если вы каким-либо образом модифицируете стандартные объекты «Дадаты», и вам нужна соответствующая JSON-схема. В этом случае вы можете взять за основу `@dadata-sdk/api-types`, изменить типы в TypeScript, и сгенерировать из изменённых типов новую схему.

### Пример использования через CLI:

```bash
pnpm schema-gen --input path/to/file.types.ts --output ./json-schema
```

### Также можно использовать программно:

```ts
import { generateSchemas } from '@dadata-sdk/schema-gen';

await generateSchemas({
  input: './path/to/file.types.ts',
  output: './json-schema',
  tsconfig: 'tsconfig.schema-gen.json', // опционально
});
```

Выводит предупреждения в консоль, если есть что-либо, требующее внимания.

Каких-либо настраиваемых опций на текущий момент не предоставляет.
