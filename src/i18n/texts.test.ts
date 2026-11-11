import { afterEach, describe, expect, it } from 'vitest';
import { currentLanguage, LANGUAGES, setLanguage, text, TEXTS } from './texts';

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

describe('A37 text table in both languages', () => {
  it('has a table for English and for German', () => {
    expect(Object.keys(TEXTS).sort()).toEqual([...LANGUAGES].sort());
  });
});

describe('A38 setting the language', () => {
  afterEach(() => setLanguage('en'));

  it('gives the texts of the language set last', () => {
    setLanguage('de');
    expect(currentLanguage()).toBe('de');
    expect(text('defaultName')).toBe('Katze');
    setLanguage('en');
    expect(currentLanguage()).toBe('en');
    expect(text('defaultName')).toBe('Kitty');
  });
});
