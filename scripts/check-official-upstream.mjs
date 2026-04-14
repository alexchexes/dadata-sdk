import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const OFFICIAL_SPECS = [
  {
    name: 'cleaner',
    localPath: 'packages/api-spec/official/cleaner.yml',
    url: 'https://dadata.ru/files/openapi/cleaner.yml',
  },
  {
    name: 'suggestions',
    localPath: 'packages/api-spec/official/suggestions.yml',
    url: 'https://dadata.ru/files/openapi/suggestions.yml',
  },
  {
    name: 'profile',
    localPath: 'packages/api-spec/official/profile.yml',
    url: 'https://dadata.ru/files/openapi/profile.yml',
  },
];

const report = [];

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

function normalizeYaml(source) {
  return source
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .trim();
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function printReport(items) {
  const changed = items.filter((item) => item.status === 'changed_upstream');
  const failed = items.filter((item) => item.status === 'fetch_failed');

  console.log('Official upstream spec freshness report\n');

  for (const item of items) {
    console.log(`- ${item.name}: ${item.status}`);
    console.log(`  url: ${item.url}`);

    if (item.httpStatus) {
      console.log(`  http: ${item.httpStatus}`);
    }

    if (item.status === 'fetch_failed') {
      console.log(`  error: ${item.statusText}`);
      continue;
    }

    if (item.lastModified) {
      console.log(`  last-modified: ${item.lastModified}`);
    }

    if (item.etag) {
      console.log(`  etag: ${item.etag}`);
    }

    console.log(`  local sha256:  ${item.localSha256}`);
    console.log(`  remote sha256: ${item.remoteSha256}`);
    console.log(`  local bytes:   ${item.localBytes}`);
    console.log(`  remote bytes:  ${item.remoteBytes}`);
  }

  console.log('\nSummary:');
  console.log(`- up to date: ${items.length - changed.length - failed.length}`);
  console.log(`- changed upstream: ${changed.length}`);
  console.log(`- fetch failed: ${failed.length}`);

  if (changed.length > 0) {
    console.log('\nChanged upstream files:');
    for (const item of changed) {
      console.log(`- ${item.name}`);
    }
  }
}
