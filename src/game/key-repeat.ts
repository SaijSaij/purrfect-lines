// Key repeat for the two move directions (A7), without a clock: the game
// passes the elapsed time in. The first step on a key press is made by the
// game itself; this class only says when a held key repeats.
import { REPEAT_DELAY_MS, REPEAT_INTERVAL_MS } from './constants';

export type Direction = 'left' | 'right';

export class KeyRepeat {
  /** Held directions in the order they were pressed; the last one is active. */
  private readonly held: Direction[] = [];
  private elapsedMs = 0;
  private waitMs = REPEAT_DELAY_MS;

  get active(): Direction | null {
    return this.held[this.held.length - 1] ?? null;
  }

  press(direction: Direction): void {
    if (this.held.includes(direction)) return;
    this.held.push(direction);
    this.restart();
  }

  /** Releasing the active key hands over to the other one, with a new delay and no step. */
  release(direction: Direction): void {
    const wasActive = this.active === direction;
    const index = this.held.indexOf(direction);
    if (index >= 0) this.held.splice(index, 1);
    if (wasActive) this.restart();
  }

  msUntilNext(): number {
    return this.active === null ? Infinity : this.waitMs - this.elapsedMs;
  }

  /** Advances the time; returns the direction if a repeat is due now. */
  advance(ms: number): Direction | null {
    const direction = this.active;
    if (direction === null) return null;
    this.elapsedMs += ms;
    if (this.elapsedMs < this.waitMs) return null;
    this.elapsedMs -= this.waitMs;
    this.waitMs = REPEAT_INTERVAL_MS;
    return direction;
  }

  private restart(): void {
    this.elapsedMs = 0;
    this.waitMs = REPEAT_DELAY_MS;
  }
}
