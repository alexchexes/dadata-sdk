# Official Comparison Scripts

This directory holds shared helpers for the temporary staged official-vs-ours comparison work.

Current script roles:

- `compare-official.ts`: legacy broad report across checked-in official specs. Keep it as a reference until the staged pipeline covers the same surface.
- `compare-official-suggestions-stage-a.ts`: Stage A for `suggestions`; validates curated operation mappings and can write a projected official spec.
- `compare-official-suggestions-stage-b.ts`: Stage B for `suggestions`; runs Stage A projection, builds the matching slice from `dadata.json`, applies comparison-only normalization, then runs `oasdiff`.

Naming:

- Stage A is the operation inventory/projection gate.
- Stage B is the payload-schema comparison prototype built on top of a clean Stage A projection.

Temporary parts:

- `oasdiff breaking` output is useful for reports, but not trusted as the semantic source of truth.
- The broad legacy comparer should not receive deep refactors unless it is needed to preserve coverage while the staged pipeline is incomplete.
