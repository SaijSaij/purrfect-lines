// Draws the game state onto a canvas. Plain interim look: framed field with
// ghost piece, and a sidebar with score, lines, level and the next piece.
import { BOARD_HEIGHT, BOARD_WIDTH } from '../game/constants';
import { absoluteCells, landingPosition, type ActivePiece, type GameState } from '../game/game';
import { pieceCells, type PieceType } from '../game/pieces';
import { text, type TextKey } from '../i18n/texts';
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

function cellLeft(x: number): number {
  return BORDER_PX + x * CELL_PX;
}

function cellTop(y: number): number {
  return BORDER_PX + y * CELL_PX;
}

function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, type: PieceType): void {
  if (y < 0) return; // rows above the field are not drawn (A1)
  ctx.fillStyle = PIECE_COLORS[type];
  ctx.fillRect(cellLeft(x) + 1, cellTop(y) + 1, CELL_PX - 2, CELL_PX - 2);
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
  ctx.fillStyle = PIECE_COLORS[type];
  for (const { x, y } of cells) {
    const left = boxLeft + (x + offsetX) * PREVIEW_CELL_PX;
    const cellTopPx = boxTop + (y + offsetY) * PREVIEW_CELL_PX;
    ctx.fillRect(left + 1, cellTopPx + 1, PREVIEW_CELL_PX - 2, PREVIEW_CELL_PX - 2);
  }
}

/** Score, lines and level (A20) and the next piece (A19). */
function drawSidebar(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.fillStyle = PALETTE.sidebar;
  ctx.fillRect(SIDEBAR_LEFT_PX, 0, SIDEBAR_WIDTH_PX, CANVAS_HEIGHT);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  drawPreview(ctx, state.next, CELL_PX);
  const valuesTop = CELL_PX * 6;
  drawValue(ctx, 'score', state.score, valuesTop);
  drawValue(ctx, 'lines', state.lines, valuesTop + 2.5 * CELL_PX);
  drawValue(ctx, 'level', state.level, valuesTop + 5 * CELL_PX);
}

function drawGameOver(ctx: CanvasRenderingContext2D): void {
  const bandHeight = CELL_PX * 3;
  const bandTop = BORDER_PX + (FIELD_HEIGHT_PX - bandHeight) / 2;
  ctx.fillStyle = PALETTE.overlay;
  ctx.fillRect(BORDER_PX, bandTop, FIELD_WIDTH_PX, bandHeight);
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text('gameOver'), SIDEBAR_LEFT_PX / 2, bandTop + bandHeight / 2);
}

export function drawGame(ctx: CanvasRenderingContext2D, state: GameState): void {
  drawField(ctx, state);
  drawSidebar(ctx, state);
  if (state.status === 'gameOver') drawGameOver(ctx);
}
