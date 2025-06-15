import chalk from 'chalk';

export const log = console.info;
export const logY = (...args: any[]) => log(chalk.yellowBright(...args));

/**
 * Generic "boxed" logger used by logPanic & logWarn.
 */
const boxLog = (message: string, bg: (text: string) => string, fg: (text: string) => string) => {
  const lines = message.split('\n');
  const longest = Math.max(...lines.map((l) => l.length));
  const pad = 1; // spaces on each side
  const width = longest + pad * 2;

  const border = ' '.repeat(width);

  const paddedLines = lines.map((l) => {
    const left = ' '.repeat(pad);
    const right = ' '.repeat(width - l.length - pad);
    return bg(left + fg(l) + right);
  });

  log([bg(border), ...paddedLines, bg(border)].join('\n'));
};

export const logPanic = (message: string) => boxLog(message, chalk.bgRed, chalk.yellowBright);

export const logWarn = (message: string) => boxLog(message, chalk.bgYellow, chalk.black);
