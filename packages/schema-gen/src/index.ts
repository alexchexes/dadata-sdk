import * as fs from 'node:fs';
import * as path from 'node:path';
import * as prettier from 'prettier';
import { tsToSchema } from './util/tsToSchema.js';
import { writeToFile } from './util/writeToFile.js';

export interface GenerateOptions {
  /** Directory or file containing `.types.ts` definitions */
  inputDirOrFile: string;
  /** Directory where generated schemas will be placed */
  outputDir: string;
  /** Path to tsconfig used for type generation */
  tsconfigPath?: string;
}

export async function generateSchemas(options: GenerateOptions) {
  const absoluteInput = path.resolve(options.inputDirOrFile);
  const absoluteOutput = path.resolve(options.outputDir);

  let files: string[] = [];
  const stats = fs.lstatSync(absoluteInput);
  if (stats.isDirectory()) {
    files = fs
      .readdirSync(absoluteInput)
      .filter((f) => f.endsWith('.types.ts'))
      .map((f) => path.join(absoluteInput, f));
  } else {
    files = [absoluteInput];
  }

  await Promise.all(
    files.map(async (file) => {
      const schema = tsToSchema({ path: file, tsconfig: options.tsconfigPath });
      const schemaString = await prettier.format(JSON.stringify(schema), {
        parser: 'json',
        printWidth: 120,
      });
      const fileName = path.basename(file, '.types.ts');
      const outFile = path.join(absoluteOutput, `${fileName}.json`);
      writeToFile(outFile, schemaString);
    }),
  );
}
