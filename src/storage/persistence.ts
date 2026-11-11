// Saving the high score list and the settings (A30). The browser's
// localStorage is passed in as a KeyValueStore, so tests can use a fake one.
import { HIGHSCORE_SIZE, NAME_MAX_LENGTH } from '../game/constants';
import type { HighscoreEntry } from '../highscores/highscores';

/** The part of the Storage interface (localStorage) the game uses. Both methods may throw. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const HIGHSCORES_KEY = 'purrfect-lines.highscores';
export const SETTINGS_KEY = 'purrfect-lines.settings';

/** Saved settings. Sound (A34) and language (A38) follow in later milestones. */
export interface Settings {
  /** The name entered last, to prefill the name entry (A27). */
  readonly lastName: string;
}

export const DEFAULT_SETTINGS: Settings = { lastName: '' };

export interface Persistence {
  /**
   * False once the store is missing or reading or writing failed. The game
   * then keeps the list only until reload and shows a hint (A30).
   */
  readonly available: boolean;
  /** Never throws; unreadable data gives an empty list, invalid entries are dropped. */
  loadHighscores(): HighscoreEntry[];
  /** Never throws. */
  saveHighscores(entries: readonly HighscoreEntry[]): void;
  /** Never throws; unreadable data gives the default settings. */
  loadSettings(): Settings;
  /** Never throws. */
  saveSettings(settings: Settings): void;
}

function isWholeNumber(value: unknown, min: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min;
}

function isValidEntry(value: unknown): value is HighscoreEntry {
  if (typeof value !== 'object' || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.name === 'string' &&
    e.name.length >= 1 &&
    e.name.length <= NAME_MAX_LENGTH &&
    isWholeNumber(e.score, 1) &&
    isWholeNumber(e.lines, 0) &&
    isWholeNumber(e.level, 1) &&
    typeof e.date === 'string' &&
    !Number.isNaN(Date.parse(e.date))
  );
}

/** Keeps the valid entries, highest score first; equal scores keep their stored (age) order. */
function toHighscores(data: unknown): HighscoreEntry[] {
  if (!Array.isArray(data)) return [];
  const entries = data.filter(isValidEntry).map((e) => ({
    name: e.name,
    score: e.score,
    lines: e.lines,
    level: e.level,
    date: e.date,
  }));
  return entries.sort((a, b) => b.score - a.score).slice(0, HIGHSCORE_SIZE);
}

function toSettings(data: unknown): Settings {
  if (typeof data !== 'object' || data === null) return DEFAULT_SETTINGS;
  const lastName = (data as Record<string, unknown>).lastName;
  return {
    lastName:
      typeof lastName === 'string' && lastName.length <= NAME_MAX_LENGTH
        ? lastName
        : DEFAULT_SETTINGS.lastName,
  };
}

function parse(raw: string | null): unknown {
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null; // unreadable data is replaced, not a storage failure
  }
}

/** `store` is null if the browser offers no storage at all. */
export function createPersistence(store: KeyValueStore | null): Persistence {
  let available = store !== null;

  const read = (key: string): unknown => {
    if (store === null) return null;
    try {
      return parse(store.getItem(key));
    } catch {
      available = false;
      return null;
    }
  };

  const write = (key: string, value: unknown): void => {
    if (store === null) return;
    try {
      store.setItem(key, JSON.stringify(value));
    } catch {
      available = false;
    }
  };

  return {
    get available() {
      return available;
    },
    loadHighscores: () => toHighscores(read(HIGHSCORES_KEY)),
    saveHighscores: (entries) => write(HIGHSCORES_KEY, entries),
    loadSettings: () => toSettings(read(SETTINGS_KEY)),
    saveSettings: (settings) => write(SETTINGS_KEY, settings),
  };
}
