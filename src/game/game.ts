// Game rules without DOM, canvas, audio or clock. Input arrives as actions,
// time as elapsed milliseconds (update), so tests can control both.
import { clearFullRows, createBoard, isOccupied, placeCells, type Board } from './board';
import {
  BOARD_WIDTH,
  GRAVITY_MS,
  LOCK_DELAY_MS,
  LOCK_RESETS_MAX,
  SOFT_DROP_FACTOR,
} from './constants';
import { KeyRepeat } from './key-repeat';
import { kickOffsets } from './kicks';
import { boxSize, pieceCells, type CellOffset, type PieceType, type Rotation } from './pieces';
import { randomSeed } from './random';
import { createPieceSequence, type PieceSequence } from './sequence';

export type Action = 'left' | 'right' | 'softDrop' | 'hardDrop' | 'rotateCW' | 'rotateCCW';

/** Where new pieces come from. Usually a seeded bag sequence (A3). */
export type PieceSource = PieceSequence;

export type GameStatus = 'playing' | 'gameOver';

export interface ActivePiece {
  readonly type: PieceType;
  readonly rotation: Rotation;
  /** Column of the top-left corner of the rotation box. */
  readonly x: number;
  /** Row of the top-left corner of the rotation box (negative above the field). */
  readonly y: number;
}

export interface GameState {
  readonly status: GameStatus;
  readonly board: Board;
  readonly active: ActivePiece | null;
  readonly next: PieceType;
  readonly level: number;
  /** Always 0 until points are added in a later milestone. */
  readonly score: number;
  readonly lines: number;
}

export interface Game {
  readonly state: GameState;
  press(action: Action): void;
  release(action: Action): void;
  update(deltaMs: number): void;
}

export interface GameOptions {
  seed?: number;
  sequence?: PieceSource;
  board?: Board;
  /** Level the game starts on (A18, A40). Default 1. */
  startLevel?: number;
}

/** Where the piece would end up after a hard drop; shown as the ghost piece (A14). */
export function landingPosition(board: Board, piece: ActivePiece): ActivePiece {
  void board;
  return piece;
}

/** Board coordinates of the blocks of a piece. */
export function absoluteCells(piece: ActivePiece): CellOffset[] {
  return pieceCells(piece.type, piece.rotation).map(({ x, y }) => ({
    x: piece.x + x,
    y: piece.y + y,
  }));
}

/** Lowest board row a block of the piece is in. */
function bottomRow(piece: ActivePiece): number {
  return Math.max(...absoluteCells(piece).map((cell) => cell.y));
}

function fits(board: Board, piece: ActivePiece): boolean {
  return absoluteCells(piece).every(({ x, y }) => !isOccupied(board, x, y));
}

/** Spawn position (A4): box centred horizontally, top block row in row 1. */
function spawnPiece(type: PieceType): ActivePiece {
  const topRow = Math.min(...pieceCells(type, 0).map((cell) => cell.y));
  return {
    type,
    rotation: 0,
    x: Math.floor((BOARD_WIDTH - boxSize(type)) / 2),
    y: -topRow,
  };
}

class GameSession implements Game {
  private board: Board;
  private active: ActivePiece | null = null;
  private status: GameStatus = 'playing';
  private readonly level = 1;
  private lines = 0;
  private fallTimerMs = 0;
  /** Time the piece has rested since the last restart of the lock delay (A13). */
  private lockTimerMs = 0;
  private lockResets = 0;
  /** Lowest block row the current piece has reached so far. */
  private lowestRow = 0;
  private readonly held = new Set<Action>();
  private readonly repeat = new KeyRepeat();

  constructor(
    private readonly source: PieceSource,
    board: Board,
  ) {
    this.board = board;
    this.spawn();
  }

  get state(): GameState {
    return {
      status: this.status,
      board: this.board,
      active: this.active,
      next: this.source.peek(),
      level: this.level,
      score: 0,
      lines: this.lines,
    };
  }

  press(action: Action): void {
    // A repeated press without release is the operating system's key repeat
    // and is ignored (A7, A8, A12).
    if (this.status !== 'playing' || this.held.has(action)) return;
    this.held.add(action);
    if (action === 'left' || action === 'right') this.repeat.press(action);
    this.apply(action);
  }

  release(action: Action): void {
    this.held.delete(action);
    if (action === 'left' || action === 'right') this.repeat.release(action);
  }

  /**
   * Splits the elapsed time at every due event (key repeat, fall step), so
   * one long update gives the same result as many short ones.
   */
  update(deltaMs: number): void {
    let remainingMs = deltaMs;
    while (this.status === 'playing' && remainingMs > 0) {
      const stepMs = Math.min(remainingMs, Math.max(0, this.msUntilNextEvent()));
      remainingMs -= stepMs;
      this.advance(stepMs);
    }
  }

  private msUntilNextEvent(): number {
    const lockMs = this.isGrounded() ? LOCK_DELAY_MS - this.lockTimerMs : Infinity;
    return Math.min(this.repeat.msUntilNext(), this.fallInterval() - this.fallTimerMs, lockMs);
  }

  /**
   * Advances all timers and runs the events that are due, in a fixed order:
   * key repeat, fall step, locking. The lock delay only runs while the piece rests.
   */
  private advance(ms: number): void {
    if (this.isGrounded()) this.lockTimerMs += ms;
    this.fallTimerMs += ms;
    const direction = this.repeat.advance(ms);
    if (direction !== null) this.playerMove(direction === 'left' ? -1 : 1);
    const interval = this.fallInterval();
    if (this.fallTimerMs >= interval) {
      this.fallTimerMs -= interval;
      this.fallStep();
    }
    if (this.isGrounded() && this.lockTimerMs >= LOCK_DELAY_MS) this.lock();
  }

  private apply(action: Action): void {
    switch (action) {
      case 'left':
        this.playerMove(-1);
        break;
      case 'right':
        this.playerMove(1);
        break;
      case 'rotateCW':
        this.playerRotate(1);
        break;
      case 'rotateCCW':
        this.playerRotate(3);
        break;
      case 'hardDrop':
        this.hardDrop();
        break;
      case 'softDrop':
        // The shorter interval applies while held (A11). Restart the timer so
        // time collected at normal speed does not turn into several steps.
        this.fallTimerMs = 0;
        break;
    }
  }

  private fallInterval(): number {
    const gravity = GRAVITY_MS[Math.min(this.level, GRAVITY_MS.length) - 1] ?? Number.NaN;
    return this.held.has('softDrop') ? gravity / SOFT_DROP_FACTOR : gravity;
  }

  private tryMove(dx: number, dy: number): boolean {
    if (this.active === null) return false;
    const moved = { ...this.active, x: this.active.x + dx, y: this.active.y + dy };
    if (!fits(this.board, moved)) return false;
    this.active = moved;
    return true;
  }

  /** Turns by a quarter (1) or three quarters (3, i.e. counter-clockwise), trying the wall kicks (A9). */
  private tryRotate(quarterTurns: 1 | 3): boolean {
    const piece = this.active;
    if (piece === null) return false;
    const rotation = ((piece.rotation + quarterTurns) % 4) as Rotation;
    for (const kick of kickOffsets(piece.type, piece.rotation, rotation)) {
      const rotated = { ...piece, rotation, x: piece.x + kick.x, y: piece.y + kick.y };
      if (fits(this.board, rotated)) {
        this.active = rotated;
        return true;
      }
    }
    return false;
  }

  private playerMove(dx: number): void {
    const wasGrounded = this.isGrounded();
    if (this.tryMove(dx, 0)) this.afterPlayerMove(wasGrounded);
  }

  private playerRotate(quarterTurns: 1 | 3): void {
    const wasGrounded = this.isGrounded();
    if (this.tryRotate(quarterTurns)) this.afterPlayerMove(wasGrounded);
  }

  /** Whether the piece rests on blocks or the floor. */
  private isGrounded(): boolean {
    const piece = this.active;
    return piece !== null && !fits(this.board, { ...piece, y: piece.y + 1 });
  }

  /** A13: reaching a lower row than ever before gives the piece all restarts back. */
  private trackLowestRow(): void {
    if (this.active === null) return;
    const bottom = bottomRow(this.active);
    if (bottom > this.lowestRow) {
      this.lowestRow = bottom;
      this.lockResets = 0;
    }
  }

  /**
   * A13: a successful move or rotation of a piece that rests before or after
   * it restarts the lock delay, at most LOCK_RESETS_MAX times; lifting the
   * piece off counts too. With no restarts left, a resting piece locks at once.
   * A piece lifted off the ground does not count down until it rests again.
   */
  private afterPlayerMove(wasGrounded: boolean): void {
    this.trackLowestRow();
    this.lockTimerMs = 0;
    const grounded = this.isGrounded();
    if (!wasGrounded && !grounded) return; // a move in the air
    if (this.lockResets < LOCK_RESETS_MAX) {
      this.lockResets += 1;
      return;
    }
    if (grounded) this.lock();
  }

  /** One gravity or soft drop step. A resting piece is left to the lock delay (A13). */
  private fallStep(): void {
    if (!this.tryMove(0, 1)) return;
    this.trackLowestRow();
    this.lockTimerMs = 0;
    if (this.isGrounded() && this.lockResets >= LOCK_RESETS_MAX) this.lock();
  }

  private hardDrop(): void {
    while (this.tryMove(0, 1)) {
      // Keep falling until the piece rests.
    }
    this.lock();
  }

  private lock(): void {
    if (this.active === null) return;
    const cells = absoluteCells(this.active);
    this.board = placeCells(this.board, cells, this.active.type);
    this.active = null;
    if (cells.some((cell) => cell.y < 0)) {
      this.status = 'gameOver'; // A5, case 2
      return;
    }
    const result = clearFullRows(this.board);
    this.board = result.board;
    this.lines += result.cleared;
    this.spawn();
  }

  private spawn(): void {
    const piece = spawnPiece(this.source.next());
    this.fallTimerMs = 0;
    this.lockTimerMs = 0;
    this.lockResets = 0;
    this.lowestRow = bottomRow(piece);
    if (!fits(this.board, piece)) {
      this.status = 'gameOver'; // A5, case 1: the piece is not placed
      return;
    }
    this.active = piece;
  }
}

export function createGame(options: GameOptions = {}): Game {
  const source = options.sequence ?? createPieceSequence(options.seed ?? randomSeed());
  return new GameSession(source, options.board ?? createBoard());
}
