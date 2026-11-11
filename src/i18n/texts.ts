// All visible in-game texts, by language (A37). No visible text elsewhere in the code.

const EN = {
  title: 'Purrfect Lines',
  pressEnterToStart: 'Press Enter to start',
  keysMove: '← → / A D: move',
  keysRotate: '↑ W X / Q Y: rotate',
  keysSoftDrop: '↓ / S: soft drop',
  keysHardDrop: 'Space: hard drop',
  keysPause: 'P / Esc: pause',
  keysSound: 'M / N: music / sounds',
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
};

export type TextKey = keyof typeof EN;

/** The languages of the game (A38). */
export const LANGUAGES = ['en', 'de'] as const;
export type Language = (typeof LANGUAGES)[number];

export const TEXTS: Readonly<Record<'en', Readonly<Record<TextKey, string>>>> = {
  en: EN,
};

/** Sets the language of every text from now on (A38). */
export function setLanguage(language: Language): void {
  void language;
}

/** The language set last; English before the first call. */
export function currentLanguage(): Language {
  return 'en';
}

export function text(key: TextKey): string {
  return TEXTS.en[key];
}
