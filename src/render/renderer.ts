// Draws the game state onto a canvas: framed field with paw-printed blocks,
// ghost piece and lit full rows, and a sidebar with score, lines, level and
// the next piece. Start, pause and game over screens are HTML (screens.ts).
import { BOARD_HEIGHT, BOARD_WIDTH } from '../game/constants';
import { absoluteCells, landingPosition, type ActivePiece, type GameState } from '../game/game';
import { pieceCells, type PieceType } from '../game/pieces';
import { text, type TextKey } from '../i18n/texts';
import { drawPaw } from './decor';
import { GHOST_ALPHA, PALETTE, PIECE_COLORS } from './palette';

const CELL_PX = 30;
const BORDER_PX = 4;
const FIELD_WIDTH_PX = BOARD_WIDTH * CELL_PX;
const FIELD_HEIGHT_PX = BOARD_HEIGHT * CELL_PX;
const SIDEBAR_WIDTH_PX = 6 * CELL_PX;
const SIDEBAR_LEFT_PX = FIELD_WIDTH_PX + 2 * BORDER_PX;
const PREVIEW_CELLS = 4;
const PREVIEW_CELL_PX = 24;

export const CANVAS_WIDTH = SIDEBAR_LEFT_PX + SIDEBAR_WIDTH_PX;
export const CANVAS_HEIGHT = FIELD_HEIGHT_PX + 2 * BORDER_PX;

/** A square cell on the canvas, in logical units. */
interface CellBox {
  readonly left: number;
  readonly top: number;
  readonly size: number;
}

function cellLeft(x: number): number {
  return BORDER_PX + x * CELL_PX;
}

function cellTop(y: number): number {
  return BORDER_PX + y * CELL_PX;
}

/** One block in the piece color with a paw print (A35), in the field and in the preview alike. */
function drawPawBlock(ctx: CanvasRenderingContext2D, cell: CellBox, type: PieceType): void {
  const { left, top, size } = cell;
  ctx.fillStyle = PIECE_COLORS[type];
  ctx.fillRect(left + 1, top + 1, size - 2, size - 2);
  drawPaw(ctx, left, top, size);
}

function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, type: PieceType): void {
  if (y < 0) return; // rows above the field are not drawn (A1)
  drawPawBlock(ctx, { left: cellLeft(x), top: cellTop(y), size: CELL_PX }, type);
}

/** Pale outline where the piece would land; cells of the piece itself are left out (A14). */
function drawGhost(ctx: CanvasRenderingContext2D, state: GameState, piece: ActivePiece): void {
  const own = new Set(absoluteCells(piece).map(({ x, y }) => `${x},${y}`));
  ctx.save();
  ctx.globalAlpha = GHOST_ALPHA;
  ctx.strokeStyle = PIECE_COLORS[piece.type];
  ctx.lineWidth = 2;
  for (const { x, y } of absoluteCells(landingPosition(state.board, piece))) {
    if (y < 0 || own.has(`${x},${y}`)) continue;
    ctx.strokeRect(cellLeft(x) + 2, cellTop(y) + 2, CELL_PX - 4, CELL_PX - 4);
  }
  ctx.restore();
}

/** Full rows light up before they disappear (A16). */
function drawClearingRows(ctx: CanvasRenderingContext2D, rows: readonly number[]): void {
  ctx.fillStyle = PALETTE.flash;
  for (const y of rows) ctx.fillRect(BORDER_PX, cellTop(y), FIELD_WIDTH_PX, CELL_PX);
}

function drawField(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.fillStyle = PALETTE.frame;
  ctx.fillRect(0, 0, SIDEBAR_LEFT_PX, CANVAS_HEIGHT);
  ctx.fillStyle = PALETTE.field;
  ctx.fillRect(BORDER_PX, BORDER_PX, FIELD_WIDTH_PX, FIELD_HEIGHT_PX);
  state.board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell !== null) drawBlock(ctx, x, y, cell);
    });
  });
  drawClearingRows(ctx, state.clearingRows);
  if (state.active !== null) {
    drawGhost(ctx, state, state.active);
    for (const { x, y } of absoluteCells(state.active)) drawBlock(ctx, x, y, state.active.type);
  }
}

function drawLabel(ctx: CanvasRenderingContext2D, key: TextKey, top: number): void {
  ctx.fillStyle = PALETTE.label;
  ctx.font = '16px sans-serif';
  ctx.fillText(text(key), SIDEBAR_LEFT_PX + CELL_PX / 2, top);
}

function drawValue(ctx: CanvasRenderingContext2D, key: TextKey, value: number, top: number): void {
  drawLabel(ctx, key, top);
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(String(value), SIDEBAR_LEFT_PX + CELL_PX / 2, top + 22);
}

/** The next piece, centred in a box of PREVIEW_CELLS × PREVIEW_CELLS (A19). */
function drawPreview(ctx: CanvasRenderingContext2D, type: PieceType, top: number): void {
  drawLabel(ctx, 'next', top);
  const boxPx = PREVIEW_CELLS * PREVIEW_CELL_PX;
  const boxLeft = SIDEBAR_LEFT_PX + (SIDEBAR_WIDTH_PX - boxPx) / 2;
  const boxTop = top + 26;
  ctx.fillStyle = PALETTE.field;
  ctx.fillRect(boxLeft, boxTop, boxPx, boxPx);
  const cells = pieceCells(type, 0);
  const xs = cells.map((c) => c.x);
  const ys = cells.map((c) => c.y);
  const offsetX = (PREVIEW_CELLS - (Math.max(...xs) - Math.min(...xs) + 1)) / 2 - Math.min(...xs);
  const offsetY = (PREVIEW_CELLS - (Math.max(...ys) - Math.min(...ys) + 1)) / 2 - Math.min(...ys);
  for (const { x, y } of cells) {
    const left = boxLeft + (x + offsetX) * PREVIEW_CELL_PX;
    const cellTopPx = boxTop + (y + offsetY) * PREVIEW_CELL_PX;
    drawPawBlock(ctx, { left, top: cellTopPx, size: PREVIEW_CELL_PX }, type);
  }
}

/** Whether music and sounds are on, shown small in the sidebar (A34). */
export interface SoundState {
  readonly music: boolean;
  readonly sounds: boolean;
}

function drawSoundState(ctx: CanvasRenderingContext2D, sound: SoundState, top: number): void {
  ctx.font = '14px sans-serif';
  const lines: [boolean, TextKey][] = [
    [sound.music, sound.music ? 'musicOn' : 'musicOff'],
    [sound.sounds, sound.sounds ? 'soundsOn' : 'soundsOff'],
  ];
  lines.forEach(([on, key], i) => {
    ctx.fillStyle = on ? PALETTE.text : PALETTE.label;
    ctx.fillText(text(key), SIDEBAR_LEFT_PX + CELL_PX / 2, top + i * 20);
  });
}

/** Score, lines and level (A20), the next piece (A19) and the sound state (A34). */
function drawSidebar(ctx: CanvasRenderingContext2D, state: GameState, sound: SoundState): void {
  ctx.fillStyle = PALETTE.sidebar;
  ctx.fillRect(SIDEBAR_LEFT_PX, 0, SIDEBAR_WIDTH_PX, CANVAS_HEIGHT);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  drawPreview(ctx, state.next, CELL_PX);
  const valuesTop = CELL_PX * 6;
  drawValue(ctx, 'score', state.score, valuesTop);
  drawValue(ctx, 'lines', state.lines, valuesTop + 2.5 * CELL_PX);
  drawValue(ctx, 'level', state.level, valuesTop + 5 * CELL_PX);
  drawSoundState(ctx, sound, CANVAS_HEIGHT - 2 * CELL_PX);
}

/** Draws in logical units (CANVAS_WIDTH × CANVAS_HEIGHT), whatever the canvas size in pixels (A31). */
export function drawGame(ctx: CanvasRenderingContext2D, state: GameState, sound: SoundState): void {
  const canvas = ctx.canvas;
  ctx.setTransform(canvas.width / CANVAS_WIDTH, 0, 0, canvas.height / CANVAS_HEIGHT, 0, 0);
  drawField(ctx, state);
  drawSidebar(ctx, state, sound);
}
