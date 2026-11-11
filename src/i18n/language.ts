// Choosing the language (A38). Pure functions, the browser values are passed in.
import type { Language } from './texts';

/**
 * The language the game starts in: the saved choice if there is one, else
 * German if the browser language starts with "de", else English.
 */
export function startLanguage(saved: Language | undefined, browserLanguage: string): Language {
  if (saved !== undefined) return saved;
  return browserLanguage.toLowerCase().startsWith('de') ? 'de' : 'en';
}

/** The language L switches to on the start screen. */
export function nextLanguage(language: Language): Language {
  return language === 'en' ? 'de' : 'en';
}
