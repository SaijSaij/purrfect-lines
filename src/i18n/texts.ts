// All visible in-game texts, by language (A37). No visible text elsewhere in the code.

const EN = {
  title: 'Purrfect Lines',
  pressEnterToStart: 'Press Enter to start',
  /** Shown instead of pressEnterToStart on devices without a fine pointer (A47). */
  keyboardNeeded: 'This game is played with a physical keyboard – best opened on a computer.',
  keysMove: '← → / A D: move',
  keysRotate: '↑ W X / Q Y: rotate',
  keysSoftDrop: '↓ / S: soft drop',
  keysHardDrop: 'Space: hard drop',
  keysPause: 'P / Esc: pause',
  keysSound: 'M / N: music / sounds',
  /** Names the language L switches to (A38). */
  keysLanguage: 'L: Deutsch',
  paused: 'Paused',
  resume: 'Resume',
  giveUp: 'Give up',
  gameOver: 'Game over',
  pressEnter: 'Press Enter',
  score: 'Score',
  lines: 'Lines',
  level: 'Level',
  next: 'Next',
  /** Sound state in the sidebar (A34), e.g. "Music: on". */
  musicOn: 'Music: on',
  musicOff: 'Music: off',
  soundsOn: 'Sounds: on',
  soundsOff: 'Sounds: off',
  /** Used when the name entry stays empty (A27). */
  defaultName: 'Kitty',
  highscores: 'High scores',
  noEntries: 'No entries yet',
  storageUnavailable: 'Saving is not possible: high scores last until reload',
  newHighscore: 'New high score!',
  enterName: 'Enter your name:',
  nameEntryKeys: 'Enter: save · Esc: skip',
  rank: '#',
  name: 'Name',
  date: 'Date',
  /** The link in the line under the game (A46). */
  sourceCode: 'Source code',
  /** The license in the line under the game (A45, A46). */
  licenseName: 'GPL-3.0',
};

export type TextKey = keyof typeof EN;

/** The languages of the game (A38). */
export const LANGUAGES = ['en', 'de'] as const;
export type Language = (typeof LANGUAGES)[number];

const DE: Readonly<Record<TextKey, string>> = {
  title: 'Purrfect Lines',
  pressEnterToStart: 'Enter drücken zum Starten',
  keyboardNeeded: 'Gespielt wird mit einer echten Tastatur – am besten am Computer öffnen.',
  keysMove: '← → / A D: schieben',
  keysRotate: '↑ W X / Q Y: drehen',
  keysSoftDrop: '↓ / S: schneller fallen',
  keysHardDrop: 'Leertaste: sofort fallen',
  keysPause: 'P / Esc: Pause',
  keysSound: 'M / N: Musik / Klänge',
  keysLanguage: 'L: English',
  paused: 'Pause',
  resume: 'Weiter',
  giveUp: 'Aufgeben',
  gameOver: 'Spielende',
  pressEnter: 'Enter drücken',
  score: 'Punkte',
  lines: 'Reihen',
  level: 'Level',
  next: 'Nächste',
  musicOn: 'Musik: an',
  musicOff: 'Musik: aus',
  soundsOn: 'Klänge: an',
  soundsOff: 'Klänge: aus',
  defaultName: 'Katze',
  highscores: 'Bestenliste',
  noEntries: 'Noch keine Einträge',
  storageUnavailable: 'Speichern nicht möglich: Bestenliste gilt bis zum Neuladen',
  newHighscore: 'Neuer Rekord!',
  enterName: 'Dein Name:',
  nameEntryKeys: 'Enter: speichern · Esc: überspringen',
  rank: '#',
  name: 'Name',
  date: 'Datum',
  sourceCode: 'Quellcode',
  licenseName: 'GPL-3.0',
};

export const TEXTS: Readonly<Record<Language, Readonly<Record<TextKey, string>>>> = {
  en: EN,
  de: DE,
};

let current: Language = 'en';

/** Sets the language of every text from now on (A38). */
export function setLanguage(language: Language): void {
  current = language;
}

/** The language set last; English before the first call. */
export function currentLanguage(): Language {
  return current;
}

/** The text for `key` in the current language. */
export function text(key: TextKey): string {
  return TEXTS[current][key];
}
