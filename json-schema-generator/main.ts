import * as fs from 'fs';
import * as path from 'path';
import { tsToSchema } from './util/tsToSchema';
import { writeToFile } from './util/writeToFile';
import { log } from './util/log';
import chalk from 'chalk';

const BASE_OUTPUT_DIR = 'json-schema';
const TYPES_DIR = 'json-schema-generator/types-to-extract';

function generateSchemasFromDirectory() {
  const absoluteTypesDir = path.resolve(TYPES_DIR);

  const files = fs.readdirSync(absoluteTypesDir).filter((file) => file.endsWith('.types.ts'));

  files.forEach((file) => {
    log(chalk.bgWhite.black(`\n Generating JSON-schema from file: ${TYPES_DIR}/${file} `));

    const fullPath = path.join(absoluteTypesDir, file);

    const schema = tsToSchema({ path: fullPath });
    const schemaString = JSON.stringify(schema, null, 2);

    const outputFileName = path.basename(file, '.types.ts');
    const outputFile = `${BASE_OUTPUT_DIR}/${outputFileName}.json`;
    writeToFile(outputFile, schemaString);
  });
}

generateSchemasFromDirectory();
