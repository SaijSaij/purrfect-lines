// Development-only test helpers (A39–A43). main.ts loads this module only
// when import.meta.env.DEV is true, so it is not part of the release bundle.
// `npm run check:release` verifies that via the markers "__purrfectLines" and
// "purrfect-lines-debug".
import { LOCK_RESETS_MAX } from '../game/constants';
import { absoluteCells, type Game } from '../game/game';
import { PALETTE } from '../render/palette';

const LOG_PREFIX = '[purrfect-lines-debug]';

/** Reads ?seed=<integer> (A39). Invalid values are ignored and reported. */
export function seedFromUrl(search: string): number | undefined {
  const raw = new URLSearchParams(search).get('seed');
  if (raw === null) return undefined;
  const seed = Number(raw);
  if (!/^-?\d+$/.test(raw) || !Number.isSafeInteger(seed)) {
    console.warn(`${LOG_PREFIX} ignoring invalid seed "${raw}"`);
    return undefined;
  }
  return seed;
}

/** Reads a whole number from min to max. Invalid values are ignored and reported. */
function intParam(search: string, name: string, min: number, max: number): number | undefined {
  const raw = new URLSearchParams(search).get(name);
  if (raw === null) return undefined;
  const value = Number(raw);
  if (!/^\d+$/.test(raw) || value < min || value > max) {
    console.warn(`${LOG_PREFIX} ignoring invalid ${name} "${raw}" (whole number ${min}–${max})`);
    return undefined;
  }
  return value;
}

/** Reads ?level=<1–99> (A40). Invalid values are ignored and reported. */
export function levelFromUrl(search: string): number | undefined {
  return intParam(search, 'level', 1, 99);
}

/** Reads ?slow=<1–10> (A41). Invalid values are ignored and reported. */
export function slowFromUrl(search: string): number | undefined {
  return intParam(search, 'slow', 1, 10);
}

/** Lets the whole game run `factor` times slower by dividing the elapsed time (A41). */
export function slowMotion(game: Game, factor: number): Game {
  return {
    get state() {
      return game.state;
    },
    get diagnostics() {
      return game.diagnostics;
    },
    press: (action) => game.press(action),
    release: (action) => game.release(action),
    update: (deltaMs) => game.update(deltaMs / factor),
  };
}

/** Whether ?debug is given (A42). */
export function debugFromUrl(search: string): boolean {
  return new URLSearchParams(search).has('debug');
}

function debugLines(game: Game, slow: number, fps: number): string[] {
  const { level } = game.state;
  const d = game.diagnostics;
  const lock = d.lockRemainingMs === null ? '–' : `${Math.round(d.lockRemainingMs)} ms`;
  return [
    `level      ${level}`,
    `fall       ${Math.round(d.fallIntervalMs * 10) / 10} ms`,
    `lock left  ${lock}`,
    `resets     ${d.lockResets}/${LOCK_RESETS_MAX}`,
    `bag        ${d.bag.join(' ')}`,
    `seed       ${d.seed ?? '–'}`,
    `slow       ${slow}× (times above are game time)`,
    `fps        ${fps}`,
  ];
}

/**
 * Shows internal values as text at the left edge (A42). Returns a function to
 * call once per frame with the real frame time. `slow` is the slow motion
 * factor (A41). Labels are developer-only and therefore not in the text table.
 */
export function createDebugOverlay(slow = 1): (game: Game, frameMs: number) => void {
  const panel = document.createElement('pre');
  panel.id = 'purrfect-lines-debug';
  Object.assign(panel.style, {
    position: 'fixed',
    top: '8px',
    left: '8px',
    margin: '0',
    padding: '6px 8px',
    font: '12px monospace',
    color: PALETTE.text,
    background: PALETTE.overlay,
    pointerEvents: 'none',
  });
  document.body.append(panel);
  let frames = 0;
  let elapsedMs = 0;
  let fps = 0;
  return (game, frameMs) => {
    frames += 1;
    elapsedMs += frameMs;
    if (elapsedMs >= 1000) {
      fps = Math.round((frames * 1000) / elapsedMs);
      frames = 0;
      elapsedMs = 0;
    }
    panel.textContent = debugLines(game, slow, fps).join('\n');
  };
}

function snapshot(game: Game): unknown {
  const state = game.state;
  return {
    screen: state.status,
    board: state.board.map((row) => [...row]),
    active:
      state.active === null
        ? null
        : { type: state.active.type, cells: absoluteCells(state.active) },
    next: state.next,
    score: state.score,
    lines: state.lines,
    level: state.level,
  };
}

/** Exposes a read-only view of the current game as window.__purrfectLines (A43). */
export function installTestInterface(currentGame: () => Game): void {
  Object.defineProperty(window, '__purrfectLines', {
    get: () => snapshot(currentGame()),
    configurable: true,
  });
}
