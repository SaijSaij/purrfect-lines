// The line under the game area with the link to the source code (A46).
import { text } from '../i18n/texts';
import { PALETTE } from '../render/palette';

/** The repository with the source code; the only place in the code that names it. */
export const SOURCE_CODE_URL = 'https://github.com/SaijSaij/purrfect-lines';

/** Height of the line in CSS pixels; the game area leaves this much room below it (A31). */
export const SOURCE_LINE_HEIGHT_PX = 22;

const FONT_PX = 12;
const SEPARATOR = ' · ';

export interface SourceLine {
  /** The line, to be placed under the game area. */
  readonly el: HTMLElement;
  /** Sets the texts again in the current language (A38). */
  relabel(): void;
}

/** Builds the line "Purrfect Lines · Source code · GPL-3.0" with its link. */
export function createSourceLine(): SourceLine {
  const el = document.createElement('div');
  el.id = 'source-line';
  Object.assign(el.style, {
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    height: `${SOURCE_LINE_HEIGHT_PX}px`,
    lineHeight: `${SOURCE_LINE_HEIGHT_PX}px`,
    font: `${FONT_PX}px sans-serif`,
    color: PALETTE.label,
    textAlign: 'center',
    whiteSpace: 'nowrap',
  });

  const link = document.createElement('a');
  link.href = SOURCE_CODE_URL;
  link.target = '_blank';
  link.rel = 'noopener';
  // Keys stay with the game: Tab never reaches the link, so Enter never opens it.
  link.tabIndex = -1;
  link.style.color = 'inherit';
  // A click would leave the focus on the link, and Enter after returning would open it again.
  link.addEventListener('click', () => link.blur());

  const relabel = (): void => {
    link.textContent = text('sourceCode');
    el.replaceChildren(`${text('title')}${SEPARATOR}`, link, `${SEPARATOR}${text('licenseName')}`);
  };
  relabel();
  return { el, relabel };
}
