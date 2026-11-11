// Start, pause and game over screens (A22, A23, A26) as HTML over the canvas.
// They cover the whole game area with an opaque background.
import type { GameState } from '../game/game';
import { text, type TextKey } from '../i18n/texts';
import { PALETTE } from '../render/palette';
import { PAUSE_MENU } from './pause-menu';

export type Screen = 'start' | 'playing' | 'paused' | 'gameOver';

export interface Screens {
  /** Shows the element of the given screen and hides the others. */
  show(screen: Screen, state: GameState, menuIndex: number): void;
}

function element(tag: string, key?: TextKey, id?: string): HTMLElement {
  const el = document.createElement(tag);
  if (key !== undefined) el.textContent = text(key);
  if (id !== undefined) el.id = id;
  return el;
}

function screenElement(id: string): HTMLElement {
  const el = element('div', undefined, id);
  Object.assign(el.style, {
    position: 'absolute',
    inset: '0',
    display: 'none',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.8em',
    background: PALETTE.screen,
    color: PALETTE.text,
    font: '1em sans-serif',
    textAlign: 'center',
  });
  return el;
}

function heading(key: TextKey): HTMLElement {
  const el = element('h1', key);
  Object.assign(el.style, { margin: '0 0 0.5em', fontSize: '2em' });
  return el;
}

function hint(key: TextKey): HTMLElement {
  const el = element('p', key);
  Object.assign(el.style, { margin: '0', color: PALETTE.label });
  return el;
}

function startScreen(): HTMLElement {
  const el = screenElement('start-screen');
  el.append(heading('title'), element('p', 'pressEnterToStart'));
  const keys: TextKey[] = ['keysMove', 'keysRotate', 'keysSoftDrop', 'keysHardDrop', 'keysPause'];
  for (const key of keys) el.append(hint(key));
  return el;
}

function pauseScreen(): { el: HTMLElement; entries: HTMLElement[] } {
  const el = screenElement('pause-screen');
  const entries = PAUSE_MENU.map((entry) => element('p', entry));
  for (const entry of entries) entry.style.margin = '0';
  el.append(heading('paused'), ...entries);
  return { el, entries };
}

function valueRow(key: TextKey, id: string): { row: HTMLElement; value: HTMLElement } {
  const row = element('p');
  row.style.margin = '0';
  const value = element('strong', undefined, id);
  row.append(`${text(key)}: `, value);
  return { row, value };
}

function gameOverScreen(): { el: HTMLElement; values: Record<'score' | 'lines' | 'level', HTMLElement> } {
  const el = screenElement('game-over-screen');
  const score = valueRow('score', 'game-over-score');
  const lines = valueRow('lines', 'game-over-lines');
  const level = valueRow('level', 'game-over-level');
  el.append(heading('gameOver'), score.row, lines.row, level.row, hint('pressEnter'));
  return { el, values: { score: score.value, lines: lines.value, level: level.value } };
}

export function createScreens(container: HTMLElement): Screens {
  const start = startScreen();
  const pause = pauseScreen();
  const gameOver = gameOverScreen();
  container.append(start, pause.el, gameOver.el);
  const toggle = (el: HTMLElement, visible: boolean): void => {
    el.style.display = visible ? 'flex' : 'none';
  };
  return {
    show(screen, state, menuIndex) {
      toggle(start, screen === 'start');
      toggle(pause.el, screen === 'paused');
      toggle(gameOver.el, screen === 'gameOver');
      pause.entries.forEach((entry, i) => {
        entry.style.color = i === menuIndex ? PALETTE.highlight : PALETTE.text;
      });
      gameOver.values.score.textContent = String(state.score);
      gameOver.values.lines.textContent = String(state.lines);
      gameOver.values.level.textContent = String(state.level);
    },
  };
}
