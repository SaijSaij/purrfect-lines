import { describe, expect, it } from 'vitest';
import { HIGHSCORE_SIZE, NAME_MAX_LENGTH } from '../game/constants';
import type { HighscoreEntry } from '../highscores/highscores';
import {
  createPersistence,
  DEFAULT_SETTINGS,
  HIGHSCORES_KEY,
  SETTINGS_KEY,
  type KeyValueStore,
} from './persistence';

/** An in-memory stand-in for localStorage. */
class FakeStore implements KeyValueStore {
  readonly data = new Map<string, string>();
  failReads = false;
  failWrites = false;

  getItem(key: string): string | null {
    if (this.failReads) throw new Error('SecurityError');
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.failWrites) throw new Error('QuotaExceededError');
    this.data.set(key, value);
  }
}

function entry(score: number, name = `P${score}`): HighscoreEntry {
  return { name, score, lines: 3, level: 2, date: '2026-11-11T10:00:00.000Z' };
}

describe('A30 saving the high score list and settings', () => {
  it('starts with an empty list and the default settings when nothing is stored', () => {
    const persistence = createPersistence(new FakeStore());
    expect(persistence.loadHighscores()).toEqual([]);
    expect(persistence.loadSettings()).toEqual(DEFAULT_SETTINGS);
    expect(persistence.available).toBe(true);
  });

  it('loads a saved list again after a reload', () => {
    const store = new FakeStore();
    // Equal scores: the older entry stays ahead after a reload (A29).
    const list = [entry(500, 'Mia'), entry(200, 'Older'), entry(200, 'Newer')];
    createPersistence(store).saveHighscores(list);
    expect(createPersistence(store).loadHighscores()).toEqual(list);
  });

  it('loads the saved last name again after a reload', () => {
    const store = new FakeStore();
    createPersistence(store).saveSettings({ lastName: 'Mia' });
    expect(createPersistence(store).loadSettings().lastName).toBe('Mia');
  });

  it('keeps the list and the settings apart', () => {
    const store = new FakeStore();
    const persistence = createPersistence(store);
    persistence.saveHighscores([entry(500)]);
    persistence.saveSettings({ lastName: 'Mia' });
    const reloaded = createPersistence(store);
    expect(reloaded.loadHighscores()).toEqual([entry(500)]);
    expect(reloaded.loadSettings().lastName).toBe('Mia');
  });
});

describe('A34 saving the sound settings', () => {
  it('has music and sounds on at the first start', () => {
    const settings = createPersistence(new FakeStore()).loadSettings();
    expect(settings.music).toBe(true);
    expect(settings.sounds).toBe(true);
  });

  it('loads switched-off music and sounds again after a reload', () => {
    const store = new FakeStore();
    createPersistence(store).saveSettings({ music: false, sounds: false });
    const reloaded = createPersistence(store).loadSettings();
    expect(reloaded.music).toBe(false);
    expect(reloaded.sounds).toBe(false);
  });

  it('keeps the other settings when saving one of them', () => {
    const store = new FakeStore();
    createPersistence(store).saveSettings({ lastName: 'Mia' });
    createPersistence(store).saveSettings({ music: false });
    createPersistence(store).saveSettings({ sounds: false });
    createPersistence(store).saveSettings({ music: true });
    expect(createPersistence(store).loadSettings()).toEqual({
      lastName: 'Mia',
      music: true,
      sounds: false,
    });
  });

  it('replaces music and sounds of the wrong type by the defaults and keeps the rest', () => {
    const store = new FakeStore();
    store.data.set(SETTINGS_KEY, JSON.stringify({ lastName: 'Mia', music: 'no', sounds: 0 }));
    expect(createPersistence(store).loadSettings()).toEqual({
      lastName: 'Mia',
      music: DEFAULT_SETTINGS.music,
      sounds: DEFAULT_SETTINGS.sounds,
    });
  });
});

describe('A30 storage failures', () => {
  it('without any storage: empty list, default settings, not available, saving does not throw', () => {
    const persistence = createPersistence(null);
    expect(persistence.loadHighscores()).toEqual([]);
    expect(persistence.loadSettings()).toEqual(DEFAULT_SETTINGS);
    expect(() => persistence.saveHighscores([entry(100)])).not.toThrow();
    expect(() => persistence.saveSettings({ lastName: 'Mia' })).not.toThrow();
    expect(persistence.available).toBe(false);
  });

  it('reading throws: empty list, default settings, not available', () => {
    const store = new FakeStore();
    store.data.set(HIGHSCORES_KEY, JSON.stringify([entry(100)]));
    store.failReads = true;
    const persistence = createPersistence(store);
    expect(persistence.loadHighscores()).toEqual([]);
    expect(persistence.loadSettings()).toEqual(DEFAULT_SETTINGS);
    expect(persistence.available).toBe(false);
  });

  it('writing throws: saving does not throw, not available', () => {
    const store = new FakeStore();
    store.failWrites = true;
    const persistence = createPersistence(store);
    expect(() => persistence.saveHighscores([entry(100)])).not.toThrow();
    expect(() => persistence.saveSettings({ lastName: 'Mia' })).not.toThrow();
    expect(persistence.available).toBe(false);
  });
});

describe('A30 unreadable data', () => {
  function storeWith(highscores: string | null, settings: string | null = null): FakeStore {
    const store = new FakeStore();
    if (highscores !== null) store.data.set(HIGHSCORES_KEY, highscores);
    if (settings !== null) store.data.set(SETTINGS_KEY, settings);
    return store;
  }

  it('replaces a list that is not JSON by an empty list', () => {
    const persistence = createPersistence(storeWith('{not json'));
    expect(persistence.loadHighscores()).toEqual([]);
  });

  it('replaces a list of the wrong type by an empty list', () => {
    const persistence = createPersistence(storeWith(JSON.stringify({ score: 100 })));
    expect(persistence.loadHighscores()).toEqual([]);
  });

  it('drops invalid entries and keeps the valid ones', () => {
    const valid = [entry(500, 'Mia'), entry(200, 'Kitty')];
    const stored = [
      valid[0],
      { ...entry(400), score: -400 },
      { ...entry(350), score: '350' },
      { ...entry(300), name: 42 },
      { ...entry(250), date: 'yesterday' },
      { ...entry(0) },
      { ...entry(260), name: '' },
      { ...entry(270), name: 'N'.repeat(NAME_MAX_LENGTH + 1) },
      { ...entry(280), score: 280.5 },
      { ...entry(290), level: 0 },
      { name: 'Half', score: 240 },
      null,
      'text',
      valid[1],
    ];
    const persistence = createPersistence(storeWith(JSON.stringify(stored)));
    expect(persistence.loadHighscores()).toEqual(valid);
  });

  it('keeps at most HIGHSCORE_SIZE entries, highest score first', () => {
    const stored = Array.from({ length: HIGHSCORE_SIZE + 2 }, (_, i) => entry((i + 1) * 100));
    const loaded = createPersistence(storeWith(JSON.stringify(stored))).loadHighscores();
    expect(loaded).toHaveLength(HIGHSCORE_SIZE);
    expect(loaded[0]?.score).toBe((HIGHSCORE_SIZE + 2) * 100);
    expect(loaded.map((e) => e.score)).not.toContain(200);
  });

  it('replaces settings that are not JSON by the default settings', () => {
    const persistence = createPersistence(storeWith(null, 'nonsense'));
    expect(persistence.loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('replaces a last name of the wrong type by the default', () => {
    const persistence = createPersistence(storeWith(null, JSON.stringify({ lastName: 7 })));
    expect(persistence.loadSettings().lastName).toBe(DEFAULT_SETTINGS.lastName);
  });

  it('does not count unreadable data as a storage failure', () => {
    const persistence = createPersistence(storeWith('{not json', 'nonsense'));
    persistence.loadHighscores();
    persistence.loadSettings();
    expect(persistence.available).toBe(true);
  });
});
