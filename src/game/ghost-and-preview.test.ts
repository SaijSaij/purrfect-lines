import { describe, expect, it } from 'vitest';
import type { Board } from './board';
import { createGame, landingPosition, type ActivePiece, type Game } from './game';
import { pieceCells, type PieceType } from './pieces';
import {
  activeCells,
  advanceUntil,
  at,
  boardWith,
  filledCells,
  fixedSequence,
  sortPoints,
  tap,
  translate,
  type Point,
} from './testing';

function newGame(pieces: readonly PieceType[], board?: Board): Game {
  return createGame({ sequence: fixedSequence(pieces), board });
}

function activePiece(game: Game): ActivePiece {
  const piece = game.state.active;
  if (piece === null) throw new Error('No falling piece');
  return piece;
}

function ghostCells(game: Game): Point[] {
  const ghost = landingPosition(game.state.board, activePiece(game));
  return translate(pieceCells(ghost.type, ghost.rotation), ghost.x, ghost.y);
}

describe('A14 ghost piece', () => {
  it('lies where a hard drop puts the piece on an empty board', () => {
    const game = newGame(['T', 'O']);
    const ghost = ghostCells(game);
    tap(game, 'hardDrop');
    expect(filledCells(game.state.board)).toEqual(ghost);
  });

  it('follows the moved and rotated piece and stops on blocks', () => {
    const blocks = [at(2, 12), at(3, 16), at(4, 18)];
    const game = newGame(['L', 'O'], boardWith(blocks));
    tap(game, 'left');
    tap(game, 'left');
    tap(game, 'rotateCW');
    const ghost = ghostCells(game);
    expect(ghost).not.toEqual(activeCells(game));
    tap(game, 'hardDrop');
    expect(filledCells(game.state.board)).toEqual(sortPoints([...blocks, ...ghost]));
  });

  it('is the piece itself when the piece already rests', () => {
    // A block right below the middle of the T at spawn.
    const game = newGame(['T'], boardWith([at(5, 3)]));
    expect(ghostCells(game)).toEqual(activeCells(game));
  });
});

describe('A19 preview', () => {
  it('always shows the piece that appears next', () => {
    const game = createGame({ seed: 3 });
    let checked = 0;
    while (game.state.status === 'playing') {
      const preview = game.state.next;
      tap(game, 'hardDrop');
      if (game.state.status !== 'playing') break;
      advanceUntil(game, () => game.state.active !== null);
      expect(activePiece(game).type).toBe(preview);
      checked += 1;
    }
    expect(checked).toBeGreaterThanOrEqual(7);
  });
});
