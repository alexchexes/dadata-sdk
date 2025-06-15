#!/usr/bin/env node
import { generateSchemas } from './index.js';
import { Command } from 'commander';

const program = new Command();

program
  .option('-i, --input <path>', 'Input directory or file with *.types.ts definitions')
  .option('-o, --output <dir>', 'Output directory or file name', 'json-schema')
  .option('--tsconfig <path>', 'Path to tsconfig.json');

program.parse(process.argv);

const opts = program.opts();

if (!opts.input) {
  console.error('Please provide --input');
  process.exit(1);
}

await generateSchemas({
  inputDirOrFile: opts.input,
  outputDirOrFile: opts.output,
  tsconfigPath: opts.tsconfig,
});
