// High score list rules (A27, A29). Pure functions: no DOM, no storage, no clock.

/** One game in the high score list (A28). `date` is an ISO 8601 timestamp. */
export interface HighscoreEntry {
  readonly name: string;
  readonly score: number;
  readonly lines: number;
  readonly level: number;
  readonly date: string;
}

/** Whether a game with this score enters the list (A29). */
export function qualifies(entries: readonly HighscoreEntry[], score: number): boolean {
  void entries;
  void score;
  return false;
}

export interface AddResult {
  /** The new list, highest score first, at most HIGHSCORE_SIZE entries. */
  readonly entries: readonly HighscoreEntry[];
  /** Position of the new entry in `entries`, or null if it did not enter the list. */
  readonly index: number | null;
}

/**
 * Adds a finished game to the list (A29). The new entry is the most recent
 * one, so on equal scores it goes behind the older entries.
 */
export function addEntry(entries: readonly HighscoreEntry[], entry: HighscoreEntry): AddResult {
  void entry;
  return { entries: [...entries], index: null };
}

/**
 * Turns the text of the name field into the stored name (A27): at most
 * NAME_MAX_LENGTH characters, without spaces at the start and end, and
 * `defaultName` if nothing is left.
 */
export function normalizeName(raw: string, defaultName: string): string {
  void defaultName;
  return raw;
}
