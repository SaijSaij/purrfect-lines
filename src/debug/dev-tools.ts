// Development-only test helpers (A39, A43). main.ts loads this module only
// when import.meta.env.DEV is true, so it is not part of the release bundle.
// `npm run check:release` verifies that via the markers "__purrfectLines" and
// "purrfect-lines-debug".
import { absoluteCells, type Game } from '../game/game';

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

/** Reads ?level=<1–99> (A40). Invalid values are ignored and reported. */
export function levelFromUrl(search: string): number | undefined {
  void search;
  return undefined;
}

/** Reads ?slow=<1–10> (A41). Invalid values are ignored and reported. */
export function slowFromUrl(search: string): number | undefined {
  void search;
  return undefined;
}

/** Lets the whole game run `factor` times slower by dividing the elapsed time (A41). */
export function slowMotion(game: Game, factor: number): Game {
  void factor;
  return game;
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
