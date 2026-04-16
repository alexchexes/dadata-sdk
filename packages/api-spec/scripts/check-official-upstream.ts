import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface OfficialSourceSpec {
  name: 'cleaner' | 'suggestions' | 'profile';
  localPath: string;
  url: string;
}

interface FreshnessReportItemBase {
  name: OfficialSourceSpec['name'];
  url: string;
  httpStatus?: number;
}

interface UpToDateOrChangedItem extends FreshnessReportItemBase {
  status: 'up_to_date' | 'changed_upstream';
  etag: string | null;
  lastModified: string | null;
  localSha256: string;
  remoteSha256: string;
  localBytes: number;
  remoteBytes: number;
}

interface FetchFailedItem extends FreshnessReportItemBase {
  status: 'fetch_failed';
  statusText: string;
}

type FreshnessReportItem = UpToDateOrChangedItem | FetchFailedItem;

const OFFICIAL_SPECS: OfficialSourceSpec[] = [
  {
    name: 'cleaner',
    localPath: 'official/cleaner.yml',
    url: 'https://dadata.ru/files/openapi/cleaner.yml',
  },
  {
    name: 'suggestions',
    localPath: 'official/suggestions.yml',
    url: 'https://dadata.ru/files/openapi/suggestions.yml',
  },
  {
    name: 'profile',
    localPath: 'official/profile.yml',
    url: 'https://dadata.ru/files/openapi/profile.yml',
  },
];

async function main() {
  const report: FreshnessReportItem[] = [];

  for (const spec of OFFICIAL_SPECS) {
    const localRaw = readFileSync(resolve(spec.localPath), 'utf8');
    const remoteResponse = await fetch(spec.url, {
      headers: {
        Accept: 'application/yaml, text/yaml, text/plain;q=0.9, */*;q=0.8',
        'User-Agent': 'dadata-sdk official spec checker',
      },
    });

    if (!remoteResponse.ok) {
      report.push({
        name: spec.name,
        status: 'fetch_failed',
        url: spec.url,
        httpStatus: remoteResponse.status,
        statusText: remoteResponse.statusText,
      });
      continue;
    }

    const remoteRaw = await remoteResponse.text();
    const localNormalized = normalizeYaml(localRaw);
    const remoteNormalized = normalizeYaml(remoteRaw);
    const same = localNormalized === remoteNormalized;

    report.push({
      name: spec.name,
      status: same ? 'up_to_date' : 'changed_upstream',
      url: spec.url,
      httpStatus: remoteResponse.status,
      etag: remoteResponse.headers.get('etag'),
      lastModified: remoteResponse.headers.get('last-modified'),
      localSha256: sha256(localNormalized),
      remoteSha256: sha256(remoteNormalized),
      localBytes: Buffer.byteLength(localNormalized, 'utf8'),
      remoteBytes: Buffer.byteLength(remoteNormalized, 'utf8'),
    });
  }

  printReport(report);
}

function normalizeYaml(source: string): string {
  return source
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .trim();
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function printReport(items: FreshnessReportItem[]): void {
  const changed = items.filter((item) => item.status === 'changed_upstream');
  const failed = items.filter((item) => item.status === 'fetch_failed');

  console.info('Official upstream spec freshness report\n');

  for (const item of items) {
    console.info(`- ${item.name}: ${item.status}`);
    console.info(`  url: ${item.url}`);

    if (item.httpStatus) {
      console.info(`  http: ${item.httpStatus}`);
    }

    if (item.status === 'fetch_failed') {
      console.info(`  error: ${item.statusText}`);
      continue;
    }

    if (item.lastModified) {
      console.info(`  last-modified: ${item.lastModified}`);
    }

    if (item.etag) {
      console.info(`  etag: ${item.etag}`);
    }

    console.info(`  local sha256:  ${item.localSha256}`);
    console.info(`  remote sha256: ${item.remoteSha256}`);
    console.info(`  local bytes:   ${item.localBytes}`);
    console.info(`  remote bytes:  ${item.remoteBytes}`);
  }

  console.info('\nSummary:');
  console.info(`- up to date: ${items.length - changed.length - failed.length}`);
  console.info(`- changed upstream: ${changed.length}`);
  console.info(`- fetch failed: ${failed.length}`);

  if (changed.length > 0) {
    console.info('\nChanged upstream files:');
    for (const item of changed) {
      console.info(`- ${item.name}`);
    }
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
