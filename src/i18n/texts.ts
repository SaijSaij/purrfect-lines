// All visible in-game texts, by language (A37). No visible text elsewhere in the code.

const EN = {
  gameOver: 'Game over – press Enter',
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
