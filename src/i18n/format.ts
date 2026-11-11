// Formatting values in the chosen language (A28, A38).
import type { Language } from './texts';

/** A saved ISO date as the date of the high score list, in the local time zone. */
export function formatDate(iso: string, language: Language): string {
  void language;
  return new Date(iso).toLocaleDateString('en');
}
