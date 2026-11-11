// Entry point of Purrfect Lines: wires keyboard, screens, game loop and
// drawing to the game logic. The game starts from the start screen (A22).
import { createGame, type Action, type Game } from './game/game';
import { HeldKeys } from './input/held-keys';
import { actionForKey, menuActionForKey } from './input/keymap';
import { fitToWindow } from './render/fit';
import { PALETTE } from './render/palette';
import { drawGame } from './render/renderer';
import { entryAt, moveSelection } from './screens/pause-menu';
import { createScreens, type Screen } from './screens/screens';

let seed: number | undefined;
let startLevel: number | undefined;
/** Development builds may wrap every new game, e.g. in slow motion (A41). */
let adapt = (created: Game): Game => created;
/** Development builds may show internal values once per frame (A42). */
let onFrame: (frameMs: number) => void = () => undefined;
let game: Game;
let onStartScreen = true;
let menuIndex = 0;

function currentScreen(): Screen {
  return onStartScreen ? 'start' : game.state.status;
}

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
  devTools.installTestInterface(() => ({ screen: currentScreen(), game }));
}

function newGame(): Game {
  return adapt(createGame({ seed, startLevel }));
}

// Keys are recognised by the typed character (A21), but held keys are tracked
// by the physical key, so ← and A or ↑ and X do not interfere.
const heldKeys = new HeldKeys<Action>();

function releaseAllKeys(): void {
  for (const action of heldKeys.releaseAll()) game.release(action);
}

function pause(): void {
  if (game.state.status !== 'playing') return;
  game.pause();
  menuIndex = 0;
}

/** P, Esc or Enter on "Resume" continue; Enter on "Give up" ends the game (A23, A25). */
function onPausedKey(event: KeyboardEvent): void {
  if (actionForKey(event.key) === 'pause') {
    game.resume();
    return;
  }
  const menu = menuActionForKey(event.key);
  if (menu === 'up') menuIndex = moveSelection(menuIndex, -1);
  if (menu === 'down') menuIndex = moveSelection(menuIndex, 1);
  if (menu !== 'confirm') return;
  if (entryAt(menuIndex) === 'giveUp') game.giveUp();
  else game.resume();
}

function onPlayingKey(event: KeyboardEvent): void {
  const action = actionForKey(event.key);
  if (action === null || action === 'confirm') return;
  if (action === 'pause') {
    // A held P or Esc that just continued the game must not pause it again (A23).
    if (!event.repeat) pause();
    return;
  }
  if (!heldKeys.down(event.code, action)) return; // key repeat of the operating system
  // Another key for the same action may still be held: every new key is a new press.
  game.release(action);
  game.press(action);
}

/** Enter on the start screen starts a new game; on game over it leads back to the start screen. */
function onConfirm(screen: Screen): void {
  if (screen === 'start') {
    game = newGame();
    onStartScreen = false;
  } else if (screen === 'gameOver') {
    onStartScreen = true; // without name entry (M5), A26
  }
}

function onKeyDown(event: KeyboardEvent): void {
  const action = actionForKey(event.key);
  if (action === null) return;
  event.preventDefault(); // e.g. the space bar must not scroll the page (A21)
  const screen = currentScreen();
  if (screen === 'playing') onPlayingKey(event);
  else if (event.repeat) return; // menus react to each key press once
  else if (screen === 'paused') onPausedKey(event);
  else if (action === 'confirm') onConfirm(screen);
}

function onKeyUp(event: KeyboardEvent): void {
  if (actionForKey(event.key) !== null) event.preventDefault();
  const action = heldKeys.up(event.code);
  if (action !== null) game.release(action);
}

/**
 * Key-up events get lost while the window has no focus, so let go of
 * everything, and pause a running game (A24). It stays paused on return.
 */
function onFocusLost(): void {
  releaseAllKeys();
  pause();
}

function createGameArea(): { container: HTMLElement; canvas: HTMLCanvasElement } {
  document.body.style.background = PALETTE.page;
  const container = document.createElement('div');
  container.id = 'game';
  container.style.position = 'relative';
  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  container.append(canvas);
  document.body.append(container);
  return { container, canvas };
}

function start(): void {
  const { container, canvas } = createGameArea();
  const ctx = canvas.getContext('2d');
  if (ctx === null) throw new Error('Canvas 2D is not available');
  const screens = createScreens(container);
  fitToWindow(container, canvas);

  game = newGame(); // shown behind the start screen, replaced by a fresh game on Enter
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onFocusLost);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) onFocusLost();
  });
  window.addEventListener('resize', () => fitToWindow(container, canvas));

  let last = performance.now();
  const frame = (now: number): void => {
    const frameMs = now - last;
    if (!onStartScreen) game.update(frameMs);
    last = now;
    drawGame(ctx, game.state);
    screens.show(currentScreen(), game.state, menuIndex);
    onFrame(frameMs);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

start();
