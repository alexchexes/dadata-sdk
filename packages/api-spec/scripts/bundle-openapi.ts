import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import * as prettier from 'prettier';
import YAML from 'yaml';

const require = createRequire(path.join(process.cwd(), 'package.json'));

function resolveLocalPath(relativeOrAbsolutePath: string): string {
  return path.resolve(process.cwd(), relativeOrAbsolutePath);
}

async function main() {
  const [, , inputArg, outputJsonArg, outputYamlArg] = process.argv;

  if (!inputArg || !outputJsonArg) {
    throw new Error(
      'Usage: tsx ./scripts/bundle-openapi.ts <input-yaml> <output-json> [output-yaml]',
    );
  }

  const inputPath = resolveLocalPath(inputArg);
  const outputJsonPath = resolveLocalPath(outputJsonArg);
  const outputYamlPath = outputYamlArg ? resolveLocalPath(outputYamlArg) : null;
  const redoclyCliPath = require.resolve('@redocly/cli/bin/cli.js');

  execFileSync(process.execPath, [redoclyCliPath, 'bundle', inputPath, '-o', outputJsonPath], {
    stdio: 'inherit',
  });

  const generatedBundle = await fs.readFile(outputJsonPath, 'utf8');
  const prettierConfig = (await prettier.resolveConfig(outputJsonPath)) ?? {};
  const formattedJsonBundle = await prettier.format(generatedBundle, {
    ...prettierConfig,
    filepath: outputJsonPath,
  });

  if (formattedJsonBundle !== generatedBundle) {
    await fs.writeFile(outputJsonPath, formattedJsonBundle);
  }

  if (outputYamlPath) {
    await writeYamlBundle(outputJsonPath, outputYamlPath);
  }
}

/** Writes a YAML representation of the already bundled JSON OpenAPI artifact. */
async function writeYamlBundle(inputJsonPath: string, outputYamlPath: string): Promise<void> {
  const bundledDocument = JSON.parse(await fs.readFile(inputJsonPath, 'utf8')) as unknown;
  const yamlBundle = YAML.stringify(bundledDocument, {
    lineWidth: 0,
    singleQuote: true,
  });
  const prettierConfig = (await prettier.resolveConfig(outputYamlPath)) ?? {};
  const formattedYamlBundle = await prettier.format(yamlBundle, {
    ...prettierConfig,
    filepath: outputYamlPath,
  });

  await fs.writeFile(outputYamlPath, formattedYamlBundle);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
