import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { readText, writeText } from '../io.js';
import type { SnapshotResult, StageBOptions } from './types.js';

/** Applies requested snapshot update/check behavior to a generated Stage B snapshot. */
export function handleStageBSnapshot(
  snapshotText: string,
  options: StageBOptions,
  configuredSnapshotPath: string,
): SnapshotResult {
  const snapshotPath = resolve(configuredSnapshotPath);

  if (options.updateSnapshot) {
    mkdirSync(dirname(snapshotPath), { recursive: true });
    writeText(snapshotPath, snapshotText);

    return {
      message: 'updated',
      mode: 'update',
      ok: true,
      path: snapshotPath,
    };
  }

  if (!options.checkSnapshot) {
    return {
      message: 'not checked',
      mode: 'none',
      ok: true,
      path: snapshotPath,
    };
  }

  if (!existsSync(snapshotPath)) {
    return {
      message: 'missing snapshot; run with --update-snapshot to create it',
      mode: 'check',
      ok: false,
      path: snapshotPath,
    };
  }

  const expected = readText(snapshotPath);
  const ok = expected === snapshotText;

  return {
    message: ok ? 'matched' : 'mismatched; run with --update-snapshot if the new diff is accepted',
    mode: 'check',
    ok,
    path: snapshotPath,
  };
}
