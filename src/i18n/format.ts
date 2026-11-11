// Formatting values in the chosen language (A28, A38).
import type { Language } from './texts';

/** German dates as DD.MM.YYYY, English as M/D/YYYY, whatever the browser's settings (1 February: 01.02.2026, 2/1/2026). */
const DATE_FORMATS: Readonly<Record<Language, { locale: string; options: Intl.DateTimeFormatOptions }>> = {
  en: { locale: 'en', options: {} },
  de: { locale: 'de-DE', options: { day: '2-digit', month: '2-digit', year: 'numeric' } },
};

/** A saved ISO date as the date of the high score list, in the local time zone. */
export function formatDate(iso: string, language: Language): string {
  const { locale, options } = DATE_FORMATS[language];
  return new Date(iso).toLocaleDateString(locale, options);
}
