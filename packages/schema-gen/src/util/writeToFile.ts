import * as fs from 'fs';
import * as path from 'path';
import { log } from './log.js';
import chalk from 'chalk';

function ensureDirectoryExists(dirPath: string): void {
  const absoluteDir = path.resolve(dirPath);
  if (!fs.existsSync(absoluteDir)) {
    fs.mkdirSync(absoluteDir, { recursive: true });
  }
}

export function writeToFile(filePath: string, content: string): void {
  try {
    const absolutePath = path.resolve(filePath);
    const dir = path.dirname(absolutePath);
    ensureDirectoryExists(dir);

    fs.writeFileSync(absolutePath, content, { encoding: 'utf-8' });
    log(chalk.bgGreenBright.black(`\n Output saved to: ${filePath} `));
  } catch (err) {
    console.error(chalk.bgRed.yellowBright(`\n Failed to write file ${filePath}:\n`), err);
  }
}
