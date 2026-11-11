// The music loop (A33): an own melody on a pentatonic scale over a simple bass,
// about 30 seconds at normal speed. Notes are scheduled slightly ahead on the
// audio clock, so the loop stays in time; the tempo applies from the next note.
import { midiToHz, tone } from './synth';

/** Beats per minute at tempo 1. 12 bars of 4/4 take 30 seconds. */
const BPM = 96;
const EIGHTHS_PER_BAR = 8;
const SCHEDULER_INTERVAL_MS = 25;
const LOOKAHEAD_S = 0.1;
/** Time constant of the fade when the music stops or starts, in seconds. */
const FADE_S = 0.02;
const MELODY_VOLUME = 0.5;
const BASS_VOLUME = 0.6;

/** [MIDI note or null for a rest, length in eighths]. Each bar adds up to 8. */
type Note = readonly [number | null, number];

const MELODY: readonly Note[] = [
  [76, 2], [79, 1], [81, 1], [79, 2], [76, 2],
  [72, 2], [74, 1], [76, 1], [69, 4],
  [69, 1], [72, 1], [74, 2], [72, 1], [69, 1], [67, 2],
  [74, 3], [76, 1], [74, 2], [null, 2],
  [79, 2], [81, 1], [79, 1], [76, 2], [74, 2],
  [76, 1], [74, 1], [67, 2], [76, 2], [74, 2],
  [72, 2], [69, 2], [72, 1], [74, 1], [81, 2],
  [79, 4], [null, 2], [74, 2],
  [76, 1], [81, 1], [79, 1], [76, 1], [74, 2], [72, 2],
  [69, 2], [72, 2], [74, 3], [null, 1],
  [74, 1], [76, 1], [79, 2], [74, 2], [76, 2],
  [72, 6], [null, 2],
];

/** Root and fifth of each bar, a half bar each: C, Am, F, G, C, Em, F, G, Am, F, G, C. */
const BASS_BARS: readonly (readonly [number, number])[] = [
  [48, 55], [45, 52], [41, 48], [43, 50], [48, 55], [40, 47],
  [41, 48], [43, 50], [45, 52], [41, 48], [43, 50], [48, 55],
];

const LOOP_EIGHTHS = BASS_BARS.length * EIGHTHS_PER_BAR;

interface ScheduledNote {
  readonly note: number;
  readonly eighths: number;
  readonly bass: boolean;
}

/** All notes, indexed by the eighth they start on. */
function buildScore(): ScheduledNote[][] {
  const score: ScheduledNote[][] = Array.from({ length: LOOP_EIGHTHS }, () => []);
  let step = 0;
  for (const [note, eighths] of MELODY) {
    if (note !== null) score[step]?.push({ note, eighths, bass: false });
    step += eighths;
  }
  BASS_BARS.forEach(([root, fifth], bar) => {
    const half = EIGHTHS_PER_BAR / 2;
    score[bar * EIGHTHS_PER_BAR]?.push({ note: root, eighths: half, bass: true });
    score[bar * EIGHTHS_PER_BAR + half]?.push({ note: fifth, eighths: half, bass: true });
  });
  return score;
}

const SCORE = buildScore();

export interface Music {
  /** Starts or continues the loop where it stopped. */
  play(): void;
  /** Silences the music at once and stops scheduling; the position in the loop is kept. */
  stop(): void;
  /** Playback speed, 1 = normal (A33). */
  setTempo(tempo: number): void;
  /** The next play starts the loop from the beginning. */
  rewind(): void;
}

/** Notes already playing would ring on after the music stops; this gain fades them out. */
function createGate(
  ctx: AudioContext,
  destination: AudioNode,
): { gate: GainNode; fadeTo: (level: number) => void } {
  const gate = ctx.createGain();
  gate.connect(destination);
  const fadeTo = (level: number): void => {
    const now = ctx.currentTime;
    gate.gain.cancelScheduledValues(now);
    gate.gain.setTargetAtTime(level, now, FADE_S);
  };
  return { gate, fadeTo };
}

export function createMusic(ctx: AudioContext, destination: AudioNode): Music {
  let step = 0;
  let nextTime = 0;
  let tempo = 1;
  let timer: ReturnType<typeof setInterval> | null = null;
  const { gate, fadeTo } = createGate(ctx, destination);

  const eighthSeconds = (): number => 60 / (BPM * tempo) / 2;

  const playStep = (): void => {
    const eighth = eighthSeconds();
    for (const { note, eighths, bass } of SCORE[step] ?? []) {
      tone(ctx, gate, {
        wave: bass ? 'sine' : 'triangle',
        from: midiToHz(note),
        at: nextTime,
        duration: eighths * eighth * 0.95,
        volume: bass ? BASS_VOLUME : MELODY_VOLUME,
      });
    }
    nextTime += eighth;
    step = (step + 1) % LOOP_EIGHTHS;
  };

  const schedule = (): void => {
    // After a hang, skip what is already past instead of playing it all at once.
    if (nextTime < ctx.currentTime) nextTime = ctx.currentTime;
    while (nextTime < ctx.currentTime + LOOKAHEAD_S) playStep();
  };

  return {
    play() {
      if (timer !== null) return;
      fadeTo(1);
      nextTime = ctx.currentTime + 0.05;
      schedule();
      timer = setInterval(schedule, SCHEDULER_INTERVAL_MS);
    },
    stop() {
      if (timer === null) return;
      clearInterval(timer);
      timer = null;
      fadeTo(0);
    },
    setTempo(value) {
      tempo = value;
    },
    rewind() {
      step = 0;
    },
  };
}
