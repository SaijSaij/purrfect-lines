// The high score list as an HTML table (A28). Names are set as text, never as HTML.
import type { HighscoreEntry } from '../highscores/highscores';
import { text, type TextKey } from '../i18n/texts';
import { PALETTE } from '../render/palette';

/** The language for dates; English only until the language switch arrives (A38). */
const DATE_LOCALE = 'en';

const COLUMNS: readonly TextKey[] = ['rank', 'name', 'score', 'lines', 'level', 'date'];

function cell(tag: 'th' | 'td', content: string, alignLeft: boolean): HTMLElement {
  const el = document.createElement(tag);
  el.textContent = content;
  Object.assign(el.style, {
    padding: '0.1em 0.6em',
    textAlign: alignLeft ? 'left' : 'right',
    fontWeight: 'normal',
  });
  return el;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(DATE_LOCALE);
}

function row(entry: HighscoreEntry, rank: number, highlighted: boolean): HTMLElement {
  const tr = document.createElement('tr');
  const values = [
    String(rank),
    entry.name,
    String(entry.score),
    String(entry.lines),
    String(entry.level),
    formatDate(entry.date),
  ];
  values.forEach((value, i) => tr.append(cell('td', value, i === 1)));
  if (highlighted) {
    tr.setAttribute('aria-current', 'true');
    tr.style.color = PALETTE.highlight;
  }
  return tr;
}

/**
 * Builds the list with rank, name, score, lines, level and date, or a note if
 * it is empty. The entry at `highlight` is marked as the new one.
 */
export function highscoreTable(entries: readonly HighscoreEntry[], highlight: number | null): HTMLElement {
  if (entries.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = text('noEntries');
    Object.assign(empty.style, { margin: '0', color: PALETTE.label });
    return empty;
  }
  const table = document.createElement('table');
  Object.assign(table.style, { borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' });
  const head = document.createElement('tr');
  head.style.color = PALETTE.label;
  COLUMNS.forEach((key, i) => head.append(cell('th', text(key), i === 1)));
  table.append(head);
  entries.forEach((entry, i) => table.append(row(entry, i + 1, i === highlight)));
  return table;
}
