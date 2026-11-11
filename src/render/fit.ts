// Scales the game area to the window (A31): centred, as large as possible,
// fixed aspect ratio, and one canvas pixel per device pixel so it stays sharp.
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './renderer';

/** Font size of the screens at scale 1, in CSS pixels; screen texts use em. */
const BASE_FONT_PX = 16;

/**
 * `reservePx` is kept free above and below the game area, for the line under
 * it (A46); the same room on both sides keeps the game area centred.
 */
export function fitToWindow(container: HTMLElement, canvas: HTMLCanvasElement, reservePx: number): void {
  const availableHeight = Math.max(0, window.innerHeight - 2 * reservePx);
  const scale = Math.min(window.innerWidth / CANVAS_WIDTH, availableHeight / CANVAS_HEIGHT);
  const width = CANVAS_WIDTH * scale;
  const height = CANVAS_HEIGHT * scale;
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.fontSize = `${BASE_FONT_PX * scale}px`;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = Math.round(width * window.devicePixelRatio);
  canvas.height = Math.round(height * window.devicePixelRatio);
}
