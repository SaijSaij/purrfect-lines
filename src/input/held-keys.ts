// Tracks which physical keys are held, so that two keys for the same action
// (e.g. ← and A) do not interfere with each other (A7, A8, A21).

export class HeldKeys<A> {
  /** Physical key (KeyboardEvent.code) → the action it triggers. */
  private readonly keys = new Map<string, A>();

  /** Returns true when the key was not held yet, false for the operating system's key repeat. */
  down(code: string, action: A): boolean {
    if (this.keys.has(code)) return false;
    this.keys.set(code, action);
    return true;
  }

  /** Returns the action to release when no other held key triggers it any more, else null. */
  up(code: string): A | null {
    const action = this.keys.get(code);
    if (action === undefined) return null;
    this.keys.delete(code);
    return [...this.keys.values()].includes(action) ? null : action;
  }

  /** Forgets all held keys and returns each held action once. */
  releaseAll(): A[] {
    const actions = [...new Set(this.keys.values())];
    this.keys.clear();
    return actions;
  }
}
