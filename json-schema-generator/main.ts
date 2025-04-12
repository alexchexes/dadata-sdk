import * as fs from 'fs';
import * as path from 'path';
import { tsToSchema } from './tsToSchema';

const BASE_OUTPUT_DIR = 'json-schema';
const TYPES_DIR = 'json-schema-generator/types-to-extract';

function writeToFile(filePath: string, content: string): void {
  try {
    const absolutePath = path.resolve(filePath);
    const dir = path.dirname(absolutePath);
    ensureDirectoryExists(dir);

    fs.writeFileSync(absolutePath, content, { encoding: 'utf-8' });
  } catch (err) {
    console.error(`Failed to write file ${filePath}:`, err);
  }
}

function ensureDirectoryExists(dirPath: string): void {
  const absoluteDir = path.resolve(dirPath);
  if (!fs.existsSync(absoluteDir)) {
    fs.mkdirSync(absoluteDir, { recursive: true });
  }
}

function extractAndSave(typesSource: string, outputFileName: string) {
  const schema = tsToSchema({ path: typesSource });
  const schemaString = JSON.stringify(schema, null, 2);
  const outputFile = `${BASE_OUTPUT_DIR}/${outputFileName}.json`;
  writeToFile(outputFile, schemaString);
}

function generateSchemasFromDirectory() {
  const absoluteTypesDir = path.resolve(TYPES_DIR);

  const files = fs.readdirSync(absoluteTypesDir).filter((file) => file.endsWith('.types.ts'));

  files.forEach((file) => {
    const fullPath = path.join(absoluteTypesDir, file);
    const outputFileName = path.basename(file, '.types.ts');
    extractAndSave(fullPath, outputFileName);
  });
}

generateSchemasFromDirectory();
