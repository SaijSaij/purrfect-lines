// All visible in-game texts, by language (A37). No visible text elsewhere in the code.

const EN = {
  title: 'Purrfect Lines',
  pressEnterToStart: 'Press Enter to start',
  keysMove: '← → / A D: move',
  keysRotate: '↑ W X / Q Y: rotate',
  keysSoftDrop: '↓ / S: soft drop',
  keysHardDrop: 'Space: hard drop',
  keysPause: 'P / Esc: pause',
  paused: 'Paused',
  resume: 'Resume',
  giveUp: 'Give up',
  gameOver: 'Game over',
  pressEnter: 'Press Enter',
  score: 'Score',
  lines: 'Lines',
  level: 'Level',
  next: 'Next',
};

export type TextKey = keyof typeof EN;

export const TEXTS: Readonly<Record<'en', Readonly<Record<TextKey, string>>>> = {
  en: EN,
};

export function text(key: TextKey): string {
  return TEXTS.en[key];
}
