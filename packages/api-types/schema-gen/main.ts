import * as fs from 'node:fs';
import * as path from 'node:path';
import { generateSchemas } from '@dadata-sdk/schema-gen';

const BASE_OUTPUT_DIR = 'json-schema';
const TYPES_DIR = 'schema-gen/types-to-extract';
const TS_CONFIG = 'tsconfig.schema-gen.json';

async function main() {
  const absTypesDir = path.resolve(TYPES_DIR);
  const files = fs.readdirSync(absTypesDir).filter((f) => f.endsWith('.types.ts'));

  await Promise.all(
    files.map((file) =>
      generateSchemas({
        inputDirOrFile: path.join(absTypesDir, file),
        outputDir: BASE_OUTPUT_DIR,
        tsconfigPath: TS_CONFIG,
      })
    )
  );
}

main();
