import * as fs from 'node:fs';
import * as path from 'node:path';
import * as prettier from 'prettier';
import { tsToSchema } from './util/tsToSchema.js';
import { writeToFile } from './util/writeToFile.js';

export interface GenerateOptions {
  /** Directory or file containing `.types.ts` definitions */
  inputDirOrFile: string;
  /** Directory where generated schemas will be placed */
  outputDirOrFile: string;
  /** Path to tsconfig used for type generation */
  tsconfigPath?: string;
}

function safeStat(p: string): fs.Stats | null {
  try {
    return fs.lstatSync(p);
  } catch (e: any) {
    if (e.code === 'ENOENT') return null;
    throw e; // any other error → re-throw
  }
}

export async function generateSchemas(options: GenerateOptions) {
  const absoluteInput = path.resolve(options.inputDirOrFile);
  const absoluteOutput = path.resolve(options.outputDirOrFile);

  let files: string[] = [];

  const statsIn = fs.lstatSync(absoluteInput);
  const statsOut = safeStat(absoluteOutput);

  // treat "no extension" as a dir hint
  const outIsDir = statsOut ? statsOut.isDirectory() : path.extname(absoluteOutput) === '';

  // create dir if missing
  if (outIsDir && !statsOut) {
    fs.mkdirSync(absoluteOutput, { recursive: true });
  }

  if (statsIn.isDirectory()) {
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

      const outFile = outIsDir ? path.join(absoluteOutput, `${fileName}.json`) : absoluteOutput;

      writeToFile(outFile, schemaString);
    }),
  );
}
