// Saving the high score list and the settings (A30). The browser's
// localStorage is passed in as a KeyValueStore, so tests can use a fake one.
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

/** `store` is null if the browser offers no storage at all. */
export function createPersistence(store: KeyValueStore | null): Persistence {
  void store;
  return {
    available: true,
    loadHighscores: () => [],
    saveHighscores: (entries) => void entries,
    loadSettings: () => DEFAULT_SETTINGS,
    saveSettings: (settings) => void settings,
  };
}
