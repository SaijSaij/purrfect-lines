// Entry point of Purrfect Lines: wires keyboard, game loop and drawing to the
// game logic. The game starts as soon as the page has loaded.
import { createGame, type Action, type Game } from './game/game';
import { HeldKeys } from './input/held-keys';
import { actionForKey } from './input/keymap';
import { PALETTE } from './render/palette';
import { CANVAS_HEIGHT, CANVAS_WIDTH, drawGame } from './render/renderer';

let seed: number | undefined;
let startLevel: number | undefined;
/** Development builds may wrap every new game, e.g. in slow motion (A41). */
let adapt = (created: Game): Game => created;
/** Development builds may show internal values once per frame (A42). */
let onFrame: (frameMs: number) => void = () => undefined;
let game: Game;

if (import.meta.env.DEV) {
  const devTools = await import('./debug/dev-tools');
  const search = window.location.search;
  seed = devTools.seedFromUrl(search);
  startLevel = devTools.levelFromUrl(search);
  const slow = devTools.slowFromUrl(search);
  if (slow !== undefined) adapt = (created) => devTools.slowMotion(created, slow);
  if (devTools.debugFromUrl(search)) {
    const showDebug = devTools.createDebugOverlay(slow);
    onFrame = (frameMs) => showDebug(game, frameMs);
  }
  devTools.installTestInterface(() => game);
}

function newGame(): Game {
  return adapt(createGame({ seed, startLevel }));
}

// Keys are recognised by the typed character (A21), but held keys are tracked
// by the physical key, so ← and A or ↑ and X do not interfere.
const heldKeys = new HeldKeys<Action>();

function onKeyDown(event: KeyboardEvent): void {
  const action = actionForKey(event.key);
  if (action === null) return;
  event.preventDefault(); // e.g. the space bar must not scroll the page (A21)
  if (action === 'confirm') {
    if (game.state.status === 'gameOver') game = newGame();
    return;
  }
  if (action === 'pause') return; // not implemented yet (A23)
  if (!heldKeys.down(event.code, action)) return; // key repeat of the operating system
  // Another key for the same action may still be held: every new key is a new press.
  game.release(action);
  game.press(action);
}

function onKeyUp(event: KeyboardEvent): void {
  if (actionForKey(event.key) !== null) event.preventDefault();
  const action = heldKeys.up(event.code);
  if (action !== null) game.release(action);
}

/** Key-up events get lost while the window has no focus, so let go of everything. */
function onBlur(): void {
  for (const action of heldKeys.releaseAll()) game.release(action);
}

function start(): void {
  document.body.style.background = PALETTE.page;
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  if (ctx === null) throw new Error('Canvas 2D is not available');

  game = newGame();
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);

  let last = performance.now();
  const frame = (now: number): void => {
    const frameMs = now - last;
    game.update(frameMs);
    last = now;
    drawGame(ctx, game.state);
    onFrame(frameMs);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

start();
