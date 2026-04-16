import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import * as prettier from 'prettier';

const require = createRequire(path.join(process.cwd(), 'package.json'));

function resolveLocalPath(relativeOrAbsolutePath: string): string {
  return path.resolve(process.cwd(), relativeOrAbsolutePath);
}

async function main() {
  const [, , inputArg, outputArg] = process.argv;

  if (!inputArg || !outputArg) {
    throw new Error('Usage: tsx ./scripts/bundle-openapi.ts <input-yaml> <output-json>');
  }

  const inputPath = resolveLocalPath(inputArg);
  const outputPath = resolveLocalPath(outputArg);
  const redoclyCliPath = require.resolve('@redocly/cli/bin/cli.js');

  execFileSync(process.execPath, [redoclyCliPath, 'bundle', inputPath, '-o', outputPath], {
    stdio: 'inherit',
  });

  const generatedBundle = await fs.readFile(outputPath, 'utf8');
  const prettierConfig = (await prettier.resolveConfig(outputPath)) ?? {};
  const formattedBundle = await prettier.format(generatedBundle, {
    ...prettierConfig,
    filepath: outputPath,
  });

  if (formattedBundle !== generatedBundle) {
    await fs.writeFile(outputPath, formattedBundle);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
