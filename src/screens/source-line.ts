// The line under the game area with the link to the source code (A46).

/** The repository with the source code; the only place in the code that names it. */
export const SOURCE_CODE_URL = 'https://github.com/SaijSaij/purrfect-lines';

export interface SourceLine {
  /** The line, to be placed under the game area. */
  readonly el: HTMLElement;
  /** Sets the texts again in the current language (A38). */
  relabel(): void;
}

/** Builds the line "Purrfect Lines · Source code · GPL-3.0" with its link. */
export function createSourceLine(): SourceLine {
  throw new Error('Not implemented');
}
