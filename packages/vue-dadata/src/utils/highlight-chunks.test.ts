import { describe, expect, it } from 'vitest';

import { highlightChunks } from './highlight-chunks';

describe('highlightChunks', () => {
  // --------------------------
  // Basic sanity
  // --------------------------
  it('should return entire text as non-matching chunk if query has no matches', () => {
    const query = 'ЪЩЙ';
    const text = 'г Москва, ул Сухонская, д 1, кв 9';
    const chunks = highlightChunks(text, query);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].match === false && chunks[0].text === text).toBe(true);
  });

  it('should return original text as non-matching chunk if query is empty', () => {
    const query = '';
    const text = 'г Москва, ул Сухонская, д 1, кв 9 ';
    const chunks = highlightChunks(text, query);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].match === false && chunks[0].text === text).toBe(true);
  });

  it('should return original text as non-matching chunk if query contains only delimiters', () => {
    const query = ' , / - ';
    const text = 'г Москва';
    const chunks = highlightChunks(text, query);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].match === false && chunks[0].text === text).toBe(true);
  });

  it('should return empty string as non-matching chunk, if text is empty', () => {
    const query = 'мск сухонская';
    const text = '';
    const chunks = highlightChunks(text, query);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].match === false && chunks[0].text === '').toBe(true);
  });

  // --------------------------
  // Partial Substring Matching
  // --------------------------

  it('should match part of a longer word', () => {
    const query = 'моск просп';
    const text = 'Московский проспект';
    const chunks = highlightChunks(text, query);

    expect(chunks.some((c) => c.match && c.text === 'Моск')).toBe(true);
    expect(chunks.some((c) => c.match && c.text === 'просп')).toBe(true);
  });

  it('should match full token even if it overlaps with shorter matched token', () => {
    const query = 'г Воронеж Гмелина';
    const text = 'г Воронеж, ул Гмелина';
    const chunks = highlightChunks(text, query);

    expect(chunks.some((c) => c.match && c.text === 'г')).toBe(true); // first - "stand-alone" г
    expect(chunks.some((c) => c.match && c.text === 'Гмелина')).toBe(true); // second - "Г" in "Гмели"
  });

  it('should match all (and only) occurrences', () => {
    const query = 'ниж';
    const text = 'Нижегородская обл, г Нижний Новгород, ул Униженная';
    const chunks = highlightChunks(text, query);
    const matches = chunks.filter((c) => c.match);

    expect(matches).toHaveLength(3);
    expect(matches.every((c) => c.text.toLowerCase() === 'ниж')).toBe(true);
  });

  // --------------------------
  // Case Insensitivity
  // --------------------------

  it('should be case-insensitive (upper query, lower text)', () => {
    const query = 'КАЗАНЬ';
    const text = 'г казань';
    const chunks = highlightChunks(text, query);
    expect(chunks.some((c) => c.match && c.text === 'казань')).toBe(true);
  });

  it('should be case-insensitive (lower query, upper text)', () => {
    const query = 'казань';
    const text = 'Г КАЗАНЬ';
    const chunks = highlightChunks(text, query);
    expect(chunks.some((c) => c.match && c.text === 'КАЗАНЬ')).toBe(true);
  });

  // --------------------------
  // ё ↔ е Equivalence
  // --------------------------

  it("should match 'е' in query and 'ё' in text", () => {
    const query = 'АРХАНГЕЛЬСК ЧЕРНАЯ';
    const text = 'г Архангельск, линия Чёрная Курья 1-я';
    const chunks = highlightChunks(text, query);

    expect(chunks.find((c) => c.match && c.text === 'Чёрная')).toBeTruthy();
  });

  it("should match 'ё' in query and 'е' in text", () => {
    const query = 'НОВОКУЗНЕЦК ЧЁРНАЯ';
    const text = 'Кемеровская область - Кузбасс, г Новокузнецк, ул Черная Речка';
    const chunks = highlightChunks(text, query);

    expect(chunks.find((c) => c.match && c.text === 'Черная')).toBeTruthy();
  });

  // --------------------------
  // Short Tokens / Boundary Rules
  // --------------------------

  it('should NOT match 1/2-letter token in the middle of a word', () => {
    const query = 'г, ул';
    const text = 'пгт колхоз, проезд тульский'; // "г" and "ул" present but only inside other words
    const chunks = highlightChunks(text, query);

    expect(chunks.some((c) => c.match)).toBe(false);
  });

  it('should match 1/2-letter token at the start of a word', () => {
    const query = 'г, ул';
    const text = 'Ульяновский, Гмели';
    const chunks = highlightChunks(text, query);

    expect(chunks.find((c) => c.match && c.text === 'Г')).toBeTruthy();
    expect(chunks.find((c) => c.match && c.text === 'Ул')).toBeTruthy();
  });

  it('should match 1-letter token after digit', () => {
    const query = 'а';
    const text = 'дом 5А';
    const chunks = highlightChunks(text, query);

    expect(chunks.some((c) => c.match && c.text === 'А')).toBe(true);
  });

  it('should match 1-digit token after letter', () => {
    const query = '5';
    const text = 'дом N50';
    const chunks = highlightChunks(text, query);

    expect(chunks.some((c) => c.match && c.text === '5')).toBe(true);
  });

  it('should match 1-digit token after punctuation', () => {
    const query = '5';
    const text = 'ул "5-я"';
    const chunks = highlightChunks(text, query);

    expect(chunks.some((c) => c.match && c.text === '5')).toBe(true);
  });

  it('should match 1-letter/digit token after space', () => {
    const query = 'г Тольятти, 5';
    const text = 'Самарская обл, г Тольятти, ул 5-я';
    const chunks = highlightChunks(text, query);

    expect(chunks.some((c) => c.match && c.text === 'г')).toBe(true);
    expect(chunks.some((c) => c.match && c.text === '5')).toBe(true);
  });

  it('should match 1-letter token after punctuation', () => {
    const query = 'кооператив о';
    const text = 'Кооператив "Озеро"';
    const chunks = highlightChunks(text, query);

    expect(chunks.some((c) => c.match && c.text === 'О')).toBe(true);
  });

  it('should NOT match 1-digit token in the middle of a number', () => {
    const query = 'д 3';
    const text = 'д 833';
    const chunks = highlightChunks(text, query);

    expect(chunks.some((c) => c.match && c.text === '3')).toBe(false);
  });

  it('should match 1-digit token at the start of a number', () => {
    const query = 'д 8';
    const text = 'д 83';
    const chunks = highlightChunks(text, query);

    expect(chunks.some((c) => c.match && c.text === '8')).toBe(true);
  });

  // --------------------------
  // Overlapping Tokens
  // --------------------------

  it('should merge overlapping intervals', () => {
    const query = 'моск ков';
    const text = 'Московский вокзал';

    const chunks = highlightChunks(text, query);

    // We expect to see exactly two chunks, where one is non-match and
    // the other one is a single continuous match (because "ков" overlaps inside "москов")
    expect(chunks).toHaveLength(2);
    expect(chunks.filter((c) => c.match)).toHaveLength(1);
  });

  it('should NOT merge intervals separated by space', () => {
    const query = 'московский пр';
    const text = 'новомосковский проспект';

    const chunks = highlightChunks(text, query);

    expect(chunks).toHaveLength(5); // we expect 'Ново' + 'московский' + 'пр' + 'оспект'
    expect(chunks.some((c) => c.match && c.text === 'московский пр')).toBe(false);
  });

  // --------------------------
  // Splitting Digits and Letters in Query
  // --------------------------

  it('should split digits and letters in query and highlight both', () => {
    const query = 'д50';
    const text = 'дом 50';
    const chunks = highlightChunks(text, query);

    expect(chunks.some((c) => c.match && c.text === 'д')).toBe(true);
    expect(chunks.some((c) => c.match && c.text === '50')).toBe(true);
  });

  // --------------------------
  // Punctuation
  // --------------------------

  it('should NOT highlight stand-alone punctuation', () => {
    const query = 'г Москва , ул . " Ново - сухонская " , д 1 / 2';
    const text = 'г Москва, ул. "Ново-сухонская", д 1/3';
    const chunks = highlightChunks(text, query);

    expect(chunks.some((c) => c.match && c.text.includes('.'))).toBe(false);
    expect(chunks.some((c) => c.match && c.text.includes(','))).toBe(false);
    expect(chunks.some((c) => c.match && c.text.includes('"'))).toBe(false);
    expect(chunks.some((c) => c.match && c.text.includes('-'))).toBe(false);
    expect(chunks.some((c) => c.match && c.text.includes('/'))).toBe(false);
  });

  // --------------------------
  //  Round-Trip Check
  // --------------------------

  it('should produce chunks that rejoin into the original text', () => {
    const query = 'ул Сухумская, д 30 /10 к 8 квартира 5 ';
    const text = 'ул Сухумская, д 30/10 к 8, кв 5';
    const chunks = highlightChunks(text, query);

    expect(chunks.map((c) => c.text).join('')).toBe(text);
  });

  // --------------------------
  // Caching check
  // --------------------------

  it('should return cached result for repeated calls', () => {
    const query = 'москва';
    const text = 'г Москва';

    const first = highlightChunks(text, query);
    const second = highlightChunks(text, query);

    expect(first).toBe(second);
  });

  it('should return cached result for repeated calls when no match found', () => {
    const query = 'пушкин';
    const text = 'г Москва';

    const first = highlightChunks(text, query);
    const second = highlightChunks(text, query);

    expect(first).toBe(second);
  });
});
