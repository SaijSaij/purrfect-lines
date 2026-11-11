// Pure rules for sound and music (A33, A34), without Web Audio, so they can be unit-tested.
import { MUSIC_TEMPO_MAX, MUSIC_TEMPO_STEP } from '../game/constants';
import type { SoundToggle } from '../input/keymap';
import type { Settings } from '../storage/persistence';

/**
 * Playback speed of the music on a level: 1 on level 1, MUSIC_TEMPO_STEP
 * faster per level above, at most 1 + MUSIC_TEMPO_MAX (A33).
 */
export function musicTempo(level: number): number {
  return 1 + Math.min(Math.max(level - 1, 0) * MUSIC_TEMPO_STEP, MUSIC_TEMPO_MAX);
}

/** Switches music or sounds on or off and leaves the other settings as they are (A34). */
export function toggleSound(settings: Settings, which: SoundToggle): Settings {
  return { ...settings, [which]: !settings[which] };
}
