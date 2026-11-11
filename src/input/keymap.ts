// Key → action mapping (A21). Pure function, keys are KeyboardEvent.key values.
import type { Action } from '../game/game';

export type KeyAction = Action | 'confirm';

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
};

/** Letters are matched by the typed character, ignoring case. */
export function actionForKey(key: string): KeyAction | null {
  return KEYS[key.toLowerCase()] ?? null;
}
