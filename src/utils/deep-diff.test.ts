import { describe, it, expect } from 'vitest';
import { deepDiff } from './deep-diff';

describe('deepDiff', () => {
  it('returns null when both objects are equal', () => {
    const a = { name: 'Alice', age: 30 };
    const b = { name: 'Alice', age: 30 };
    expect(deepDiff(a, b)).toBe(null);
  });

  it('returns null when both objects are deeply equal', () => {
    const a = {
      name: 'Alice',
      age: 30,
      data: { foo: 'x', bar: 'y' },
    };
    const b = {
      name: 'Alice',
      age: 30,
      data: { foo: 'x', bar: 'y' },
    };
    expect(deepDiff(a, b)).toBe(null);
  });

  it('returns only the changed properties', () => {
    const a = { name: 'Alice', age: 30 };
    const b = { name: 'Bob', age: 30 };
    expect(deepDiff(a, b)).toEqual({ name: 'Bob' });
  });

  it('handles nested differences', () => {
    const a = { person: { name: 'Alice', age: 30 } };
    const b = { person: { name: 'Alice', age: 31 } };
    expect(deepDiff(a, b)).toEqual({ person: { age: 31 } });
  });

  it('handles null vs value differences', () => {
    const a = { val: null };
    const b = { val: 1 };
    expect(deepDiff(a, b as any)).toEqual({ val: 1 });
  });

  it('handles array differences', () => {
    const a = { items: [1, 2, 3] };
    const b = { items: [1, 2, 4] };
    expect(deepDiff(a, b)).toEqual({ items: [1, 2, 4] });
  });

  it('handles top-level array differences', () => {
    const a = [1, 2, 3];
    const b = [1, 2, 4];
    expect(deepDiff(a, b)).toEqual({ 2: 4 });
  });

  it('treats null and [] as different', () => {
    const a = { list: null };
    const b = { list: [] };
    expect(deepDiff(a, b as any)).toEqual({ list: [] });
  });

  it('deeply compares nested structures', () => {
    const original = {
      value: 'Воронеж',
      unrestricted_value: '394000, Воронежская обл, г Воронеж',
      data: {
        postal_code: 394000,
        region: 'Воронежская обл',
        geo_lat: null,
        history_names: null,
      },
    };

    const updated = {
      value: 'г Воронеж',
      unrestricted_value: '394000, Воронежская обл, г Воронеж',
      data: {
        postal_code: 394000,
        region: 'Воронежская обл',
        geo_lat: 51.659306,
        history_names: ['город Воронеж'],
      },
    };

    expect(deepDiff(original, updated as any)).toEqual({
      value: 'г Воронеж',
      data: {
        geo_lat: 51.659306,
        history_names: ['город Воронеж'],
      },
    });
  });

  it('handles missing properties both ways', () => {
    const original = {
      value: 'Воронеж',
      unrestricted_value: '394000, Воронежская обл, г Воронеж',
      data: {
        postal_code: 394000,
        region: 'Воронежская обл',
        geo_lat: null,
        history_names: null,
      },
    };

    const updated = {
      value: 'г Воронеж',
      unrestricted_value: '394000, Воронежская обл, г Воронеж',
      data: {
        postal_code: 394000,
        region: 'Воронежская обл',
        geo_lat: 51.659306,
        history_names: ['город Воронеж'],
        divisions: {},
      },
      source: 'воронеж',
    };

    expect(deepDiff(original, updated as any)).toEqual({
      value: 'г Воронеж',
      data: {
        geo_lat: 51.659306,
        history_names: ['город Воронеж'],
        divisions: {},
      },
      source: 'воронеж',
    });

    // backward
    expect(deepDiff(updated, original as any)).toEqual({
      value: 'Воронеж',
      data: {
        geo_lat: null,
        history_names: null,
        divisions: undefined,
      },
      source: undefined,
    });
  });
});
