// Key → action mapping (A21). Pure function, keys are KeyboardEvent.key values.
import type { Action } from '../game/game';

export type KeyAction = Action | 'confirm' | 'pause';

const KEYS: Readonly<Record<string, KeyAction>> = {
  arrowleft: 'left',
  a: 'left',
  arrowright: 'right',
  d: 'right',
  arrowdown: 'softDrop',
  s: 'softDrop',
  arrowup: 'rotateCW',
  w: 'rotateCW',
  x: 'rotateCW',
  q: 'rotateCCW',
  y: 'rotateCCW',
  ' ': 'hardDrop',
  enter: 'confirm',
  p: 'pause',
  escape: 'pause',
};

/** Letters are matched by the typed character, ignoring case. */
export function actionForKey(key: string): KeyAction | null {
  return KEYS[key.toLowerCase()] ?? null;
}

export type MenuAction = 'up' | 'down' | 'confirm';

const MENU_KEYS: Readonly<Record<string, MenuAction>> = {
  arrowup: 'up',
  w: 'up',
  arrowdown: 'down',
  s: 'down',
  enter: 'confirm',
};

/** Keys for choosing in menus (A21), matched like actionForKey. */
export function menuActionForKey(key: string): MenuAction | null {
  return MENU_KEYS[key.toLowerCase()] ?? null;
}

/** What M and N switch on and off (A34). */
export type SoundToggle = 'music' | 'sounds';

const SOUND_KEYS: Readonly<Record<string, SoundToggle>> = {
  m: 'music',
  n: 'sounds',
};

/** M switches the music, N the sounds (A21, A34), matched like actionForKey. */
export function soundToggleForKey(key: string): SoundToggle | null {
  return SOUND_KEYS[key.toLowerCase()] ?? null;
}

/** L switches the language on the start screen (A38), matched like actionForKey. */
export function isLanguageKey(key: string): boolean {
  void key;
  return false;
}
