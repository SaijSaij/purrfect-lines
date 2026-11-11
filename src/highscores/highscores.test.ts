import { describe, expect, it } from 'vitest';
import { HIGHSCORE_SIZE, NAME_MAX_LENGTH } from '../game/constants';
import { TEXTS } from '../i18n/texts';
import { addEntry, normalizeName, qualifies, type HighscoreEntry } from './highscores';

let clock = 0;

/** A game with the given score; every call is one minute later than the previous one. */
function game(score: number, name = `P${score}`): HighscoreEntry {
  clock += 60_000;
  return { name, score, lines: 1, level: 1, date: new Date(clock).toISOString() };
}

/** A full list with the scores HIGHSCORE_SIZE*100, …, 200, 100. */
function fullList(): HighscoreEntry[] {
  return Array.from({ length: HIGHSCORE_SIZE }, (_, i) => game((HIGHSCORE_SIZE - i) * 100));
}

function scores(entries: readonly HighscoreEntry[]): number[] {
  return entries.map((e) => e.score);
}

describe('A29 high score list', () => {
  it('adds a game with points to an empty list', () => {
    const entry = game(100);
    expect(qualifies([], 100)).toBe(true);
    const result = addEntry([], entry);
    expect(result.entries).toEqual([entry]);
    expect(result.index).toBe(0);
  });

  it('never adds a game with 0 points', () => {
    expect(qualifies([], 0)).toBe(false);
    const result = addEntry([], game(0));
    expect(result.entries).toEqual([]);
    expect(result.index).toBeNull();
  });

  it('sorts by score, highest first, and reports the position of the new entry', () => {
    const list = addEntry(addEntry([], game(200)).entries, game(500)).entries;
    const result = addEntry(list, game(300));
    expect(scores(result.entries)).toEqual([500, 300, 200]);
    expect(result.index).toBe(1);
  });

  it('puts the older entry first on equal scores', () => {
    const older = game(300, 'Old');
    const newer = game(300, 'New');
    const result = addEntry([older], newer);
    expect(result.entries.map((e) => e.name)).toEqual(['Old', 'New']);
    expect(result.index).toBe(1);
  });

  it('adds any game with points to a list that is not full, even below the last entry', () => {
    const list = fullList().slice(0, HIGHSCORE_SIZE - 1);
    expect(qualifies(list, 1)).toBe(true);
    const result = addEntry(list, game(1));
    expect(result.entries).toHaveLength(HIGHSCORE_SIZE);
    expect(result.index).toBe(HIGHSCORE_SIZE - 1);
  });

  it('lets a game that beats the last entry of a full list push that entry out', () => {
    const list = fullList();
    expect(qualifies(list, 150)).toBe(true);
    const result = addEntry(list, game(150));
    expect(result.entries).toHaveLength(HIGHSCORE_SIZE);
    expect(scores(result.entries)).not.toContain(100);
    expect(result.index).toBe(HIGHSCORE_SIZE - 1);
  });

  it('does not add a game to a full list that only equals the last entry', () => {
    const list = fullList();
    expect(qualifies(list, 100)).toBe(false);
    const result = addEntry(list, game(100));
    expect(result.entries).toEqual(list);
    expect(result.index).toBeNull();
  });

  it('does not add a game to a full list below the last entry', () => {
    const list = fullList();
    expect(qualifies(list, 99)).toBe(false);
    expect(addEntry(list, game(99)).index).toBeNull();
  });

  it('does not change the list it is given', () => {
    const list = fullList();
    const copy = [...list];
    addEntry(list, game(10_000));
    expect(list).toEqual(copy);
  });
});

describe('A27 name entry', () => {
  const DEFAULT = 'Kitty';

  it('removes spaces at the start and end', () => {
    expect(normalizeName('  Mia  ', DEFAULT)).toBe('Mia');
  });

  it('keeps spaces inside the name', () => {
    expect(normalizeName('Mr Whiskers', DEFAULT)).toBe('Mr Whiskers');
  });

  it('uses the default name if the field is empty', () => {
    expect(normalizeName('', DEFAULT)).toBe(DEFAULT);
  });

  it('uses the default name if the field holds only spaces', () => {
    expect(normalizeName('   ', DEFAULT)).toBe(DEFAULT);
  });

  it(`keeps at most NAME_MAX_LENGTH characters`, () => {
    const long = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    expect(normalizeName(long, DEFAULT)).toBe(long.slice(0, NAME_MAX_LENGTH));
  });

  it('keeps a name of exactly NAME_MAX_LENGTH characters', () => {
    const name = 'N'.repeat(NAME_MAX_LENGTH);
    expect(normalizeName(name, DEFAULT)).toBe(name);
  });

  it('cuts to NAME_MAX_LENGTH before removing spaces, like the name field does', () => {
    const typed = `  ${'A'.repeat(NAME_MAX_LENGTH)}`;
    expect(normalizeName(typed, DEFAULT)).toBe('A'.repeat(NAME_MAX_LENGTH - 2));
  });

  it('has "Kitty" as the English default name in the text table', () => {
    expect(TEXTS.en.defaultName).toBe('Kitty');
  });
});
