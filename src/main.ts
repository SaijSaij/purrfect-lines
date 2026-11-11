// Entry point of Purrfect Lines: wires keyboard, screens, storage, sound,
// game loop and drawing to the game logic. The game starts from the start
// screen (A22).
import { createAudio } from './audio/audio';
import { musicTempo, toggleSound } from './audio/sound-rules';
import { createGame, type Action, type Game } from './game/game';
import { addEntry, normalizeName, qualifies, type HighscoreEntry } from './highscores/highscores';
import { nextLanguage, startLanguage } from './i18n/language';
import { currentLanguage, setLanguage, text, type Language } from './i18n/texts';
import { HeldKeys } from './input/held-keys';
import { actionForKey, isLanguageKey, menuActionForKey, soundToggleForKey } from './input/keymap';
import { fitToWindow } from './render/fit';
import { PALETTE } from './render/palette';
import { drawGame } from './render/renderer';
import { entryAt, moveSelection } from './screens/pause-menu';
import { createScreens, type Screen, type Screens } from './screens/screens';
import { createPersistence, type KeyValueStore } from './storage/persistence';

let seed: number | undefined;
let startLevel: number | undefined;
/** Development builds may wrap every new game, e.g. in slow motion (A41). */
let adapt = (created: Game): Game => created;
/** Development builds may show internal values once per frame (A42). */
let onFrame: (frameMs: number) => void = () => undefined;
let game: Game;
let screens: Screens;
/** The menu screen shown instead of the game, or null while a game is shown. */
let menuScreen: 'start' | 'nameEntry' | 'highscores' | null = 'start';
let menuIndex = 0;

/** Even reading window.localStorage throws if the browser blocks site data (A30). */
function browserStore(): KeyValueStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const persistence = createPersistence(browserStore());
/** Kept in memory, so it lasts until reload even if saving fails (A30). */
let highscores: readonly HighscoreEntry[] = persistence.loadHighscores();
/** Kept in memory like the list; changes are saved at once (A27, A34). */
let settings = persistence.loadSettings();
/** Sets the language of all texts and of the page (A38). */
function applyLanguage(language: Language): void {
  setLanguage(language);
  document.documentElement.lang = language;
}

applyLanguage(startLanguage(settings.language, navigator.language));
const audio = createAudio();
audio.setEnabled(settings.music, settings.sounds);
/** Position of the entry saved last, highlighted on the high score screen (A27). */
let highlight: number | null = null;

function currentScreen(): Screen {
  return menuScreen ?? game.state.status;
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
  if (menu !== null) audio.menu();
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

/**
 * Enter on the start screen starts a new game. On game over it leads to the
 * name entry if the score enters the list, else to the start screen (A26).
 */
function onConfirm(screen: Screen): void {
  audio.menu();
  if (screen === 'start') {
    game = newGame();
    audio.rewindMusic();
    menuScreen = null;
  } else if (screen === 'gameOver') {
    if (qualifies(highscores, game.state.score)) {
      menuScreen = 'nameEntry';
      screens.openNameEntry(settings.lastName);
    } else {
      menuScreen = 'start';
    }
  } else if (screen === 'highscores') {
    menuScreen = 'start';
  }
}

/** Saves the finished game under the entered name and shows the list (A27, A29, A30). */
function saveEntry(): void {
  const typed = screens.enteredName();
  const { score, lines, level } = game.state;
  const name = normalizeName(typed, text('defaultName'));
  const result = addEntry(highscores, { name, score, lines, level, date: new Date().toISOString() });
  highscores = result.entries;
  highlight = result.index;
  // The prefill is what was typed, so an empty field stays empty next time.
  settings = { ...settings, lastName: normalizeName(typed, '') };
  persistence.saveHighscores(highscores);
  persistence.saveSettings({ lastName: settings.lastName });
  menuScreen = 'highscores';
}

/**
 * M switches the music, N the sounds, on every screen but the name entry
 * (A34). Returns whether the key was one of them.
 */
function onSoundKey(event: KeyboardEvent): boolean {
  const which = soundToggleForKey(event.key);
  if (which === null) return false;
  event.preventDefault();
  if (event.repeat) return true;
  settings = toggleSound(settings, which);
  persistence.saveSettings(which === 'music' ? { music: settings.music } : { sounds: settings.sounds });
  audio.setEnabled(settings.music, settings.sounds);
  return true;
}

/**
 * L on the start screen switches the language, saves the choice and shows
 * the screens in the new language (A38). Returns whether the key was L.
 */
function onLanguageKey(event: KeyboardEvent): boolean {
  if (!isLanguageKey(event.key)) return false;
  event.preventDefault();
  if (event.repeat) return true;
  const language = nextLanguage(currentLanguage());
  applyLanguage(language);
  settings = { ...settings, language };
  persistence.saveSettings({ language });
  screens.relabel();
  return true;
}

/**
 * In the name field only Enter (save) and Esc (skip, nothing is saved) do
 * something; every other key, also Space or Q, is text (A27).
 */
function onNameEntryKey(event: KeyboardEvent): void {
  if (event.key !== 'Enter' && event.key !== 'Escape') return;
  event.preventDefault();
  if (event.repeat) return;
  if (event.key === 'Enter') saveEntry();
  else menuScreen = 'start';
}

function onKeyDown(event: KeyboardEvent): void {
  audio.unlock(); // browsers allow sound only after a user gesture (A34)
  const screen = currentScreen();
  if (screen === 'nameEntry') {
    onNameEntryKey(event);
    return;
  }
  if (onSoundKey(event)) return;
  if (screen === 'start' && onLanguageKey(event)) return;
  const action = actionForKey(event.key);
  if (action === null) return;
  event.preventDefault(); // e.g. the space bar must not scroll the page (A21)
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
  // A hidden tab gets no animation frames, so stop the music here, not in the next frame (A33).
  syncMusic();
}

/** The music runs only while a game is played, at the speed of its level (A33). */
function syncMusic(): void {
  audio.setMusic(currentScreen() === 'playing', musicTempo(game.state.level));
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
  screens = createScreens(container);
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
    if (menuScreen === null) game.update(frameMs);
    last = now;
    // Events of key presses and of time are collected here once per frame (A32).
    for (const event of game.takeEvents()) audio.play(event);
    syncMusic();
    drawGame(ctx, game.state, settings);
    screens.show({
      screen: currentScreen(),
      state: game.state,
      menuIndex,
      highscores,
      highlight,
      storageAvailable: persistence.available,
    });
    onFrame(frameMs);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

start();
