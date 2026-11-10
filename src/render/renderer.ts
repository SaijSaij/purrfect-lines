// Draws the game state onto a canvas. Plain interim look: framed field and
// colored blocks, no sidebar yet.
import { BOARD_HEIGHT, BOARD_WIDTH } from '../game/constants';
import { absoluteCells, type GameState } from '../game/game';
import type { PieceType } from '../game/pieces';
import { text } from '../i18n/texts';
import { PALETTE, PIECE_COLORS } from './palette';

const CELL_PX = 30;
const BORDER_PX = 4;
const FIELD_WIDTH_PX = BOARD_WIDTH * CELL_PX;
const FIELD_HEIGHT_PX = BOARD_HEIGHT * CELL_PX;

export const CANVAS_WIDTH = FIELD_WIDTH_PX + 2 * BORDER_PX;
export const CANVAS_HEIGHT = FIELD_HEIGHT_PX + 2 * BORDER_PX;

function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, type: PieceType): void {
  if (y < 0) return; // rows above the field are not drawn (A1)
  ctx.fillStyle = PIECE_COLORS[type];
  ctx.fillRect(BORDER_PX + x * CELL_PX + 1, BORDER_PX + y * CELL_PX + 1, CELL_PX - 2, CELL_PX - 2);
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
  ctx.fillText(text('gameOver'), CANVAS_WIDTH / 2, bandTop + bandHeight / 2);
}

export function drawGame(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.fillStyle = PALETTE.frame;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = PALETTE.field;
  ctx.fillRect(BORDER_PX, BORDER_PX, FIELD_WIDTH_PX, FIELD_HEIGHT_PX);

  state.board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell !== null) drawBlock(ctx, x, y, cell);
    });
  });
  if (state.active !== null) {
    for (const { x, y } of absoluteCells(state.active)) drawBlock(ctx, x, y, state.active.type);
  }
  if (state.status === 'gameOver') drawGameOver(ctx);
}
