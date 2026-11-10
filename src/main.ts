// Entry point of Purrfect Lines: wires keyboard, game loop and drawing to the
// game logic. The game starts as soon as the page has loaded.
import { createGame, type Game } from './game/game';
import { actionForKey } from './input/keymap';
import { PALETTE } from './render/palette';
import { CANVAS_HEIGHT, CANVAS_WIDTH, drawGame } from './render/renderer';

let seed: number | undefined;
let game: Game;

if (import.meta.env.DEV) {
  const devTools = await import('./debug/dev-tools');
  seed = devTools.seedFromUrl(window.location.search);
  devTools.installTestInterface(() => game);
}

function newGame(): Game {
  return createGame({ seed });
}

function onKeyDown(event: KeyboardEvent): void {
  const action = actionForKey(event.key);
  if (action === null) return;
  event.preventDefault(); // e.g. the space bar must not scroll the page (A21)
  if (action === 'confirm') {
    if (game.state.status === 'gameOver') game = newGame();
    return;
  }
  game.press(action);
}

function onKeyUp(event: KeyboardEvent): void {
  const action = actionForKey(event.key);
  if (action === null) return;
  event.preventDefault();
  if (action !== 'confirm') game.release(action);
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

  let last = performance.now();
  const frame = (now: number): void => {
    game.update(now - last);
    last = now;
    drawGame(ctx, game.state);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

start();
