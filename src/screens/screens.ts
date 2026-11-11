// Start, pause, game over, name entry and high score screens (A22, A23,
// A26–A28) as HTML over the canvas. They cover the whole game area with an
// opaque background.
import type { GameState } from '../game/game';
import { NAME_MAX_LENGTH } from '../game/constants';
import type { HighscoreEntry } from '../highscores/highscores';
import { text, type TextKey } from '../i18n/texts';
import { catHeadSvg } from '../render/decor';
import { PALETTE } from '../render/palette';
import { highscoreTable } from './highscore-table';
import { PAUSE_MENU } from './pause-menu';

export type Screen = 'start' | 'playing' | 'paused' | 'gameOver' | 'nameEntry' | 'highscores';

/** Everything the screens show. */
export interface ScreenView {
  readonly screen: Screen;
  readonly state: GameState;
  readonly menuIndex: number;
  readonly highscores: readonly HighscoreEntry[];
  /** Position of the entry just saved, highlighted on the high score screen. */
  readonly highlight: number | null;
  /** False if saving does not work; the start screen then shows a hint (A30). */
  readonly storageAvailable: boolean;
}

export interface Screens {
  /** Shows the element of the given screen and hides the others. */
  show(view: ScreenView): void;
  /** Fills the name field with `name` and focuses it (A27). */
  openNameEntry(name: string): void;
  /** The text in the name field. */
  enteredName(): string;
  /** Builds all screens again in the current language (A38); the name field is emptied. */
  relabel(): void;
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

function heading(key: TextKey, tag = 'h1'): HTMLElement {
  const el = element(tag, key);
  Object.assign(el.style, tag === 'h1' ? { margin: '0 0 0.5em', fontSize: '2em' } : { margin: '0.4em 0 0', fontSize: '1.2em' });
  return el;
}

function hint(key: TextKey, id?: string): HTMLElement {
  const el = element('p', key, id);
  Object.assign(el.style, { margin: '0', color: PALETTE.label });
  return el;
}

/** A place for the high score table, rebuilt only when the list changes. */
function tableSlot(): HTMLElement {
  const el = element('div');
  el.style.fontSize = '0.85em';
  return el;
}

function startScreen(): { el: HTMLElement; table: HTMLElement; storageHint: HTMLElement } {
  const el = screenElement('start-screen');
  el.style.gap = '0.5em';
  // The cat head sits left of the title, so the screen gets hardly any taller (A35).
  const title = heading('title');
  Object.assign(title.style, { display: 'flex', alignItems: 'center', gap: '0.3em' });
  title.prepend(catHeadSvg(1.3));
  el.append(title, element('p', 'pressEnterToStart'));
  const keys: TextKey[] = [
    'keysMove',
    'keysRotate',
    'keysSoftDrop',
    'keysHardDrop',
    'keysPause',
    'keysSound',
    'keysLanguage',
  ];
  for (const key of keys) el.append(hint(key));
  const table = tableSlot();
  const storageHint = hint('storageUnavailable', 'storage-hint');
  Object.assign(storageHint.style, { fontSize: '0.85em', color: PALETTE.highlight });
  el.append(heading('highscores', 'h2'), table, storageHint);
  return { el, table, storageHint };
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

function nameEntryScreen(): { el: HTMLElement; input: HTMLInputElement } {
  const el = screenElement('name-entry-screen');
  const input = document.createElement('input');
  input.id = 'name-input';
  input.type = 'text';
  input.maxLength = NAME_MAX_LENGTH;
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.setAttribute('aria-label', text('enterName'));
  Object.assign(input.style, {
    font: '1.2em sans-serif',
    width: `${NAME_MAX_LENGTH + 1}ch`,
    padding: '0.2em 0.4em',
    textAlign: 'center',
    color: PALETTE.text,
    background: PALETTE.field,
    border: `2px solid ${PALETTE.frame}`,
    outline: 'none',
  });
  el.append(heading('newHighscore'), element('p', 'enterName'), input, hint('nameEntryKeys'));
  return { el, input };
}

function highscoreScreen(): { el: HTMLElement; table: HTMLElement } {
  const el = screenElement('highscore-screen');
  const table = tableSlot();
  el.append(heading('highscores'), table, hint('pressEnter'));
  return { el, table };
}

/** All screens; their texts are set when they are built. */
function buildScreens(): {
  start: ReturnType<typeof startScreen>;
  pause: ReturnType<typeof pauseScreen>;
  gameOver: ReturnType<typeof gameOverScreen>;
  nameEntry: ReturnType<typeof nameEntryScreen>;
  highscores: ReturnType<typeof highscoreScreen>;
} {
  return {
    start: startScreen(),
    pause: pauseScreen(),
    gameOver: gameOverScreen(),
    nameEntry: nameEntryScreen(),
    highscores: highscoreScreen(),
  };
}

function toggle(el: HTMLElement, visible: boolean, display = 'flex'): void {
  el.style.display = visible ? display : 'none';
}

export function createScreens(container: HTMLElement): Screens {
  let built = buildScreens();
  const elements = (): HTMLElement[] => Object.values(built).map((part) => part.el);
  container.append(...elements());
  let shownList: readonly HighscoreEntry[] | null = null;
  let shownHighlight: number | null = null;

  const updateTables = (list: readonly HighscoreEntry[], highlight: number | null): void => {
    if (list === shownList && highlight === shownHighlight) return;
    shownList = list;
    shownHighlight = highlight;
    built.start.table.replaceChildren(highscoreTable(list, null));
    built.highscores.table.replaceChildren(highscoreTable(list, highlight));
  };

  return {
    show(view) {
      const { start, pause, gameOver, nameEntry, highscores } = built;
      const { screen, state } = view;
      toggle(start.el, screen === 'start');
      toggle(pause.el, screen === 'paused');
      toggle(gameOver.el, screen === 'gameOver');
      toggle(nameEntry.el, screen === 'nameEntry');
      toggle(highscores.el, screen === 'highscores');
      pause.entries.forEach((entry, i) => {
        entry.style.color = i === view.menuIndex ? PALETTE.highlight : PALETTE.text;
      });
      gameOver.values.score.textContent = String(state.score);
      gameOver.values.lines.textContent = String(state.lines);
      gameOver.values.level.textContent = String(state.level);
      updateTables(view.highscores, view.highlight);
      toggle(start.storageHint, !view.storageAvailable, 'block');
      // Typing must always reach the name field, also after a click elsewhere (A27).
      const focused = document.activeElement === nameEntry.input;
      if (screen === 'nameEntry' && !focused) nameEntry.input.focus();
      if (screen !== 'nameEntry' && focused) nameEntry.input.blur();
    },
    openNameEntry(name) {
      const { input, el } = built.nameEntry;
      input.value = name;
      toggle(el, true);
      input.focus();
    },
    enteredName: () => built.nameEntry.input.value,
    relabel() {
      for (const el of elements()) el.remove();
      built = buildScreens();
      container.append(...elements());
      shownList = null; // the tables are built again in the next show()
    },
  };
}
