import { describe, expect, it } from 'vitest';
import { formatDate } from './format';

// Noon UTC is the same day in every European time zone.
const FIRST_OF_FEBRUARY = '2026-02-01T12:00:00.000Z';
const ELEVENTH_OF_NOVEMBER = '2026-11-11T12:00:00.000Z';

describe('A28 date in the format of the chosen language', () => {
  it('writes German dates as DD.MM.YYYY with leading zeros', () => {
    expect(formatDate(FIRST_OF_FEBRUARY, 'de')).toBe('01.02.2026');
    expect(formatDate(ELEVENTH_OF_NOVEMBER, 'de')).toBe('11.11.2026');
  });

  it('keeps the English format of the high score list', () => {
    expect(formatDate(FIRST_OF_FEBRUARY, 'en')).toBe('2/1/2026');
  });
});
