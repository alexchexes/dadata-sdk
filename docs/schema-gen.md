# TypeScript types to JSON-schema generator

`@dadata-sdk/schema-gen`

A utility for generating JSON Schema from TypeScript types.

It is a wrapper around [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator), customized for the needs of this project and enhanced with several additional post-processing passes.

The schema is processed in such a way that it becomes easier to generate meaningful code in other programming languages, using tools like [PHP Schema2Class](https://github.com/martin-helmich/php-schema2class) ([maintained fork](https://github.com/alexchexes/php-schema2class)).

- Removes artifacts like `Partial<alias-5732195...>` from the schema.
- Collapses chains of referenced generics, leaving only the main definition.
- Inlines any top-level definitions with a type other than `object`.

This tool is also useful if you modify standard DaData objects and need a corresponding JSON Schema. In such cases, you can use `@dadata-sdk/api-types` as a base, adjust the TypeScript types, and generate a new schema from the modified types.

### Example CLI usage:

```bash
pnpm schema-gen --input path/to/file.types.ts --output ./json-schema
```

### It can also be used programmatically:

```ts
import { generateSchemas } from '@dadata-sdk/schema-gen';

await generateSchemas({
  input: './path/to/file.types.ts',
  output: './json-schema',
  tsconfig: 'tsconfig.schema-gen.json', // optional
});
```

Warnings are printed to the console if anything requires attention.

In current version no configurable options available.
