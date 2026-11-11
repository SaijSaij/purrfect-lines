import { describe, expect, it } from 'vitest';
import { nextLanguage, startLanguage } from './language';

// Browser languages are given as navigator.language values.
describe('A38 start language', () => {
  it('starts in German if the browser language starts with "de"', () => {
    for (const browser of ['de', 'de-DE', 'de-AT', 'de-CH']) {
      expect(startLanguage(undefined, browser), browser).toBe('de');
    }
  });

  it('ignores the case of the browser language', () => {
    expect(startLanguage(undefined, 'DE-de')).toBe('de');
  });

  it('starts in English for every other browser language', () => {
    for (const browser of ['en', 'en-US', 'fr-FR', 'nl', '']) {
      expect(startLanguage(undefined, browser), browser).toBe('en');
    }
  });

  it('prefers the saved language over the browser language', () => {
    expect(startLanguage('de', 'en-US')).toBe('de');
    expect(startLanguage('en', 'de-DE')).toBe('en');
  });
});

describe('A38 switching the language', () => {
  it('switches from English to German and back', () => {
    expect(nextLanguage('en')).toBe('de');
    expect(nextLanguage('de')).toBe('en');
  });
});
