// Pure rules for sound and music (A33, A34), without Web Audio, so they can be unit-tested.
import type { SoundToggle } from '../input/keymap';
import type { Settings } from '../storage/persistence';

/**
 * Playback speed of the music on a level: 1 on level 1, MUSIC_TEMPO_STEP
 * faster per level above, at most 1 + MUSIC_TEMPO_MAX (A33).
 */
export function musicTempo(level: number): number {
  void level;
  return 1;
}

/** Switches music or sounds on or off and leaves the other settings as they are (A34). */
export function toggleSound(settings: Settings, which: SoundToggle): Settings {
  void which;
  return settings;
}
