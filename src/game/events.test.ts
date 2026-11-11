import { describe, expect, it } from 'vitest';
import type { Board } from './board';
import { LINES_PER_LEVEL } from './constants';
import { createGame, type Game, type GameEvent } from './game';
import type { PieceType } from './pieces';
import { advanceUntil, boardFromRows, fixedSequence, tap } from './testing';

function newGame(pieces: readonly PieceType[], board?: Board): Game {
  return createGame({ sequence: fixedSequence(pieces), board });
}

/** A board whose bottom rows are full except for column 1. */
function rowsOpenInColumnOne(count: number): Board {
  return boardFromRows(Array<string>(count).fill('.JJJJJJJJJ'));
}

/** Turns the bar upright and moves it into column 1. */
function bringBarToColumnOne(game: Game): void {
  tap(game, 'rotateCW');
  for (let i = 0; i < 5; i++) tap(game, 'left');
}

describe('A32 events for sounds', () => {
  it('reports a successful rotation in either direction', () => {
    const game = newGame(['T']);
    tap(game, 'rotateCW');
    expect(game.takeEvents()).toEqual<GameEvent[]>([{ type: 'rotate' }]);
    tap(game, 'rotateCCW');
    expect(game.takeEvents()).toEqual<GameEvent[]>([{ type: 'rotate' }]);
  });

  it('reports nothing for a rotation that does not fit', () => {
    // Only the cells of the spawned T are free in rows 1 and 2, everything
    // below is filled except the right column (as in the A9 test).
    const board = boardFromRows([
      'JJJJ.JJJJJ',
      'JJJ...JJJJ',
      ...Array<string>(18).fill('JJJJJJJJJ.'),
    ]);
    const game = newGame(['T'], board);
    tap(game, 'rotateCW');
    tap(game, 'rotateCCW');
    expect(game.takeEvents()).toEqual([]);
  });

  it('reports nothing for moving, soft drop and falling', () => {
    const game = newGame(['T']);
    tap(game, 'left');
    tap(game, 'right');
    game.press('softDrop');
    game.update(100);
    game.release('softDrop');
    game.update(2000);
    expect(game.state.active?.type).toBe('T');
    expect(game.takeEvents()).toEqual([]);
  });

  it('reports a lock by the lock delay', () => {
    const game = newGame(['T', 'O']);
    advanceUntil(game, () => game.state.active?.type === 'O');
    expect(game.takeEvents()).toEqual<GameEvent[]>([{ type: 'lock' }]);
  });

  it('reports a hard drop instead of a lock', () => {
    const game = newGame(['T', 'O']);
    tap(game, 'hardDrop');
    expect(game.takeEvents()).toEqual<GameEvent[]>([{ type: 'hardDrop' }]);
  });

  it('reports one cleared row together with the hard drop that cleared it', () => {
    const game = newGame(['I', 'O'], boardFromRows(['JJJ....JJJ']));
    tap(game, 'hardDrop');
    expect(game.takeEvents()).toEqual<GameEvent[]>([
      { type: 'hardDrop' },
      { type: 'linesCleared', count: 1 },
    ]);
  });

  it('reports four cleared rows at once with their count', () => {
    const game = newGame(['I', 'O'], rowsOpenInColumnOne(4));
    bringBarToColumnOne(game);
    game.takeEvents();
    tap(game, 'hardDrop');
    expect(game.takeEvents()).toEqual<GameEvent[]>([
      { type: 'hardDrop' },
      { type: 'linesCleared', count: 4 },
    ]);
  });

  it('reports cleared rows after a lock by the lock delay', () => {
    const game = newGame(['I', 'O'], rowsOpenInColumnOne(4));
    bringBarToColumnOne(game);
    game.takeEvents();
    advanceUntil(game, () => game.state.lines === 4);
    expect(game.takeEvents()).toEqual<GameEvent[]>([
      { type: 'lock' },
      { type: 'linesCleared', count: 4 },
    ]);
  });

  it('reports a level up once, with the new level', () => {
    const game = newGame(['I'], rowsOpenInColumnOne(LINES_PER_LEVEL));
    const events: GameEvent[] = [];
    while (game.state.lines < LINES_PER_LEVEL) {
      bringBarToColumnOne(game);
      tap(game, 'hardDrop');
      events.push(...game.takeEvents());
      advanceUntil(game, () => game.state.active !== null);
    }
    expect(game.state.level).toBe(2);
    expect(events.filter((e) => e.type === 'levelUp')).toEqual<GameEvent[]>([
      { type: 'levelUp', level: 2 },
    ]);
  });

  it('reports the end of the game once when the stack reaches the top', () => {
    const game = newGame(['O']);
    const events: GameEvent[] = [];
    for (let i = 0; i < 30 && game.state.status !== 'gameOver'; i++) {
      tap(game, 'hardDrop');
      events.push(...game.takeEvents());
    }
    expect(game.state.status).toBe('gameOver');
    expect(events.filter((e) => e.type === 'gameOver')).toHaveLength(1);
    expect(events.at(-1)).toEqual<GameEvent>({ type: 'gameOver' });
  });

  it('reports the end of the game once when giving up (A25)', () => {
    const game = newGame(['T']);
    game.pause();
    game.giveUp();
    game.giveUp();
    expect(game.takeEvents()).toEqual<GameEvent[]>([{ type: 'gameOver' }]);
  });

  it('reports every event only once', () => {
    const game = newGame(['T']);
    tap(game, 'rotateCW');
    expect(game.takeEvents()).toHaveLength(1);
    expect(game.takeEvents()).toEqual([]);
  });
});
