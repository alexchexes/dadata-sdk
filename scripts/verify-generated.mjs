import { execFileSync } from 'node:child_process';

const git = process.platform === 'win32' ? 'git.exe' : 'git';
const npmExecPath = process.env.npm_execpath;

const generatedTargets = [
  'packages/api-spec/schemas/request.json',
  'packages/api-spec/schemas/response.json',
  'packages/api-spec/dadata.json',
  'docs/vue-component-schema.json',
];

runPnpm(['--filter', '@dadata-sdk/api-types', 'gen:schema']);
runPnpm(['--filter', '@dadata-sdk/api-types', 'gen:spec']);
runPnpm(['docs:gen-vue-schema']);

const changedFiles = execFileSync(git, ['diff', '--name-only', 'HEAD', '--', ...generatedTargets], {
  encoding: 'utf8',
})
  .trim()
  .split(/\r?\n/)
  .filter(Boolean);

if (changedFiles.length > 0) {
  console.error('Generated API artifacts are out of date:');
  for (const file of changedFiles) {
    console.error(`- ${file}`);
  }
  console.error('\nRegenerate the artifacts and commit the resulting changes.');
  process.exit(1);
}

console.log('Generated API artifacts are up to date.');

function run(command, args) {
  execFileSync(command, args, { stdio: 'inherit' });
}

function runPnpm(args) {
  if (!npmExecPath) {
    throw new Error('npm_execpath is not available; run this script via pnpm.');
  }

  run(process.execPath, [npmExecPath, ...args]);
}
