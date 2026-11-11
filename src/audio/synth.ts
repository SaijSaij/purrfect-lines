// Small building blocks for synthesized sound (A32, A33). Browser only.

export interface ToneSpec {
  readonly wave: OscillatorType;
  /** Frequency in Hz at the start. */
  readonly from: number;
  /** Frequency in Hz at the end; the pitch glides there. Default: no glide. */
  readonly to?: number;
  /** Start time on the audio clock, in seconds. */
  readonly at: number;
  readonly duration: number;
  /** Peak gain, 0–1. */
  readonly volume: number;
}

const ATTACK_S = 0.005;
const SILENT = 0.0001;

/** Plays one note with a short attack and an exponential fade to silence. */
export function tone(ctx: BaseAudioContext, destination: AudioNode, spec: ToneSpec): void {
  const { wave, from, to, at, duration, volume } = spec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(from, at);
  if (to !== undefined) osc.frequency.exponentialRampToValueAtTime(to, at + duration);
  gain.gain.setValueAtTime(SILENT, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + ATTACK_S);
  gain.gain.exponentialRampToValueAtTime(SILENT, at + duration);
  osc.connect(gain).connect(destination);
  osc.start(at);
  osc.stop(at + duration + 0.02);
}

/** Frequency of a MIDI note number (69 = A4 = 440 Hz). */
export function midiToHz(note: number): number {
  return 440 * 2 ** ((note - 69) / 12);
}
