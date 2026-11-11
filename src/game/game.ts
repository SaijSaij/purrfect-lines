// Game rules without DOM, canvas, audio or clock. Input arrives as actions,
// time as elapsed milliseconds (update), so tests can control both.
import { clearFullRows, createBoard, isOccupied, placeCells, type Board } from './board';
import {
  BOARD_WIDTH,
  HARD_DROP_POINTS,
  LOCK_DELAY_MS,
  LOCK_RESETS_MAX,
  SOFT_DROP_FACTOR,
  SOFT_DROP_POINTS,
} from './constants';
import { KeyRepeat } from './key-repeat';
import { kickOffsets } from './kicks';
import { boxSize, pieceCells, type CellOffset, type PieceType, type Rotation } from './pieces';
import { randomSeed } from './random';
import { gravityMs, levelFor, linePoints } from './scoring';
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
  readonly score: number;
  readonly lines: number;
}

/** Internal values for the debug display (A42). */
export interface GameDiagnostics {
  readonly fallIntervalMs: number;
  /** Time left until the resting piece locks, or null while it does not rest (A13). */
  readonly lockRemainingMs: number | null;
  readonly lockResets: number;
  /** Pieces left in the current bag; empty if the source does not tell. */
  readonly bag: readonly PieceType[];
  /** Seed of the piece sequence, or null for a given sequence. */
  readonly seed: number | null;
}

export interface Game {
  readonly state: GameState;
  readonly diagnostics: GameDiagnostics;
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
  let landed = piece;
  for (let below = { ...piece, y: piece.y + 1 }; fits(board, below); below = { ...below, y: below.y + 1 }) {
    landed = below;
  }
  return landed;
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
  private lines = 0;
  private score = 0;
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
    private readonly startLevel: number,
    private readonly seed: number | null,
  ) {
    this.board = board;
    this.spawn();
  }

  private get level(): number {
    return levelFor(this.lines, this.startLevel);
  }

  get state(): GameState {
    return {
      status: this.status,
      board: this.board,
      active: this.active,
      next: this.source.peek(),
      level: this.level,
      score: this.score,
      lines: this.lines,
    };
  }

  get diagnostics(): GameDiagnostics {
    return {
      fallIntervalMs: this.fallInterval(),
      lockRemainingMs: this.isGrounded() ? Math.max(0, LOCK_DELAY_MS - this.lockTimerMs) : null,
      lockResets: this.lockResets,
      bag: this.source.upcoming?.() ?? [],
      seed: this.seed,
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
        // The shorter interval applies while held (A11). Cap the timer so time
        // collected at normal speed gives at most one step, but keep it, so
        // quick taps cannot hold the piece in the air.
        this.fallTimerMs = Math.min(this.fallTimerMs, this.fallInterval() - 1);
        break;
    }
  }

  private fallInterval(): number {
    const gravity = gravityMs(this.level);
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

  /**
   * One gravity or soft drop step. Only rows fallen by soft drop score (A11).
   * A resting piece is left to the lock delay (A13).
   */
  private fallStep(): void {
    if (!this.tryMove(0, 1)) return;
    if (this.held.has('softDrop')) this.score += SOFT_DROP_POINTS;
    this.trackLowestRow();
    this.lockTimerMs = 0;
    if (this.isGrounded() && this.lockResets >= LOCK_RESETS_MAX) this.lock();
  }

  /** Drops to the landing position and locks at once; every row skipped scores (A12). */
  private hardDrop(): void {
    if (this.active === null) return;
    const landed = landingPosition(this.board, this.active);
    this.score += (landed.y - this.active.y) * HARD_DROP_POINTS;
    this.active = landed;
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
    // Points use the level before the clear, even if the clear raises it (A17).
    this.score += linePoints(result.cleared, this.level);
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
  const board = options.board ?? createBoard();
  const startLevel = options.startLevel ?? 1;
  if (options.sequence !== undefined) {
    return new GameSession(options.sequence, board, startLevel, null);
  }
  const seed = options.seed ?? randomSeed();
  return new GameSession(createPieceSequence(seed), board, startLevel, seed);
}
