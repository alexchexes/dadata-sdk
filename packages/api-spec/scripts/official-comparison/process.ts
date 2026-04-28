import { spawnSync } from 'node:child_process';

export interface CommandResult {
  command: string;
  args: string[];
  status: number | null;
  stdout: string;
  stderr: string;
  error?: Error;
}

/** Runs a child process and captures stdout/stderr for report-friendly failures. */
export function runCommand(
  command: string,
  args: string[],
  options: {
    shell?: boolean;
  } = {},
): CommandResult {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: options.shell ?? false,
  });

  return {
    command,
    args,
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    error: result.error,
  };
}

/** Prints a failed command with captured process output. */
export function printFailedCommand(message: string, result: CommandResult): void {
  console.error(message);
  console.error(`command: ${result.command} ${result.args.join(' ')}`);

  if (result.error) {
    console.error(`error: ${result.error.message}`);
  }

  if (result.stdout.trim()) {
    console.error('\nstdout:');
    console.error(result.stdout.trim());
  }

  if (result.stderr.trim()) {
    console.error('\nstderr:');
    console.error(result.stderr.trim());
  }
}
