import * as fs from 'fs';
import * as path from 'path';
import * as prettier from 'prettier';
import { tsToSchema } from './util/tsToSchema';
import { writeToFile } from './util/writeToFile';
import { log } from './util/log';
import chalk from 'chalk';

const BASE_OUTPUT_DIR = 'json-schema';
const TYPES_DIR = 'schema-gen/types-to-extract';

function generateSchemasFromDirectory() {
  const absoluteTypesDir = path.resolve(TYPES_DIR);

  const files = fs.readdirSync(absoluteTypesDir).filter((file) => file.endsWith('.types.ts'));

  files.forEach(async (file) => {
    log(chalk.bgWhite.black(`\n Generating JSON-schema from file: ${TYPES_DIR}/${file} `));

    const fullPath = path.join(absoluteTypesDir, file);

    const schema = tsToSchema({ path: fullPath });
    const schemaString = await prettier.format(JSON.stringify(schema), {
      parser: 'json',
      printWidth: 120,
    });

    const outputFileName = path.basename(file, '.types.ts');
    const outputFile = `${BASE_OUTPUT_DIR}/${outputFileName}.json`;
    writeToFile(outputFile, schemaString);
  });
}

generateSchemasFromDirectory();
