import chalk from 'chalk';

export const log = console.info;
export const logY = (...args: any[]) => log(chalk.yellowBright(...args));

export const logPanic = (message: string) => {
  const lines = message.split('\n');
  const longest = Math.max(...lines.map((line) => line.length));
  const horizontalPadding = 1; // spaces on both sides
  const totalWidth = longest + horizontalPadding * 2;

  const border = ' '.repeat(totalWidth);

  const paddedLines = lines.map((line) => {
    const leftPad = ' '.repeat(horizontalPadding);
    const rightPad = ' '.repeat(totalWidth - line.length - horizontalPadding);
    return chalk.bgRed(leftPad + chalk.yellowBright(line) + rightPad);
  });

  const fullMessage = [chalk.bgRed(border), ...paddedLines, chalk.bgRed(border)].join('\n');

  log(fullMessage);
};
