import { describe, expect, it } from 'vitest';
import { MUSIC_TEMPO_MAX, MUSIC_TEMPO_STEP } from '../game/constants';
import { DEFAULT_SETTINGS, type Settings } from '../storage/persistence';
import { musicTempo, toggleSound } from './sound-rules';

describe('A33 music tempo', () => {
  it('plays at normal speed on level 1', () => {
    expect(musicTempo(1)).toBe(1);
  });

  it('gets MUSIC_TEMPO_STEP faster per level', () => {
    expect(musicTempo(2)).toBeCloseTo(1 + MUSIC_TEMPO_STEP);
    expect(musicTempo(5)).toBeCloseTo(1 + 4 * MUSIC_TEMPO_STEP);
  });

  it('is still below the maximum on level 14', () => {
    expect(musicTempo(14)).toBeCloseTo(1 + 13 * MUSIC_TEMPO_STEP);
    expect(musicTempo(14)).toBeLessThan(1 + MUSIC_TEMPO_MAX);
  });

  it('gets at most MUSIC_TEMPO_MAX faster, from level 15 on', () => {
    expect(musicTempo(15)).toBeCloseTo(1 + MUSIC_TEMPO_MAX);
    expect(musicTempo(99)).toBeCloseTo(1 + MUSIC_TEMPO_MAX);
  });
});

describe('A34 switching sound', () => {
  const settings: Settings = { ...DEFAULT_SETTINGS, lastName: 'Mia' };

  it('switches the music off and on again, and nothing else', () => {
    const off = toggleSound(settings, 'music');
    expect(off).toEqual({ ...settings, music: false });
    expect(toggleSound(off, 'music')).toEqual(settings);
  });

  it('switches the sounds off and on again, and nothing else', () => {
    const off = toggleSound(settings, 'sounds');
    expect(off).toEqual({ ...settings, sounds: false });
    expect(toggleSound(off, 'sounds')).toEqual(settings);
  });
});
