import { describe, expect, it } from 'vitest';
import { TEXTS } from './texts';

describe('A37 text table', () => {
  it('has an English table with at least one text', () => {
    expect(Object.keys(TEXTS.en).length).toBeGreaterThan(0);
  });

  it('has a non-empty text for every key in every language', () => {
    const keys = Object.keys(TEXTS.en).sort();
    for (const [language, table] of Object.entries(TEXTS)) {
      const entries = table as Record<string, unknown>;
      expect(Object.keys(entries).sort(), language).toEqual(keys);
      for (const key of keys) {
        const text = entries[key];
        expect(typeof text, `${language}.${key}`).toBe('string');
        expect(String(text).trim(), `${language}.${key}`).not.toBe('');
      }
    }
  });
});
