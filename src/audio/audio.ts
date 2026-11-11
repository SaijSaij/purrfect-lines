// Sounds (A32) and music (A33) with the Web Audio API, switched by M and N (A34).
// Browser only. Nothing plays before the first key press, because browsers
// allow sound only after a user gesture. If Web Audio is missing or fails,
// the game stays silent and keeps running.
import type { GameEvent } from '../game/game';
import { createMusic, type Music } from './music';
import { midiToHz, tone, type ToneSpec } from './synth';

/** All volumes in one place, 0–1. */
const MASTER_VOLUME = 0.5;
const MUSIC_VOLUME = 0.22;
const SOUNDS_VOLUME = 0.6;

export interface GameAudio {
  /** Call on every key press: creates or wakes up the audio on the first one. */
  unlock(): void;
  setEnabled(music: boolean, sounds: boolean): void;
  play(event: GameEvent): void;
  /** Moving the selection or confirming in a menu. */
  menu(): void;
  /** Whether the music should run now, and how fast (A33). */
  setMusic(playing: boolean, tempo: number): void;
  /** The music of the next game starts from the beginning. */
  rewindMusic(): void;
}

interface Output {
  readonly ctx: AudioContext;
  readonly sounds: GainNode;
  readonly music: Music;
}

function createOutput(): Output | null {
  if (typeof AudioContext === 'undefined') return null;
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = MASTER_VOLUME;
  master.connect(ctx.destination);
  const sounds = ctx.createGain();
  sounds.gain.value = SOUNDS_VOLUME;
  sounds.connect(master);
  const musicGain = ctx.createGain();
  musicGain.gain.value = MUSIC_VOLUME;
  musicGain.connect(master);
  return { ctx, sounds, music: createMusic(ctx, musicGain) };
}

/** Notes one after another, `gap` seconds apart. */
function arpeggio(out: Output, notes: readonly number[], gap: number, wave: OscillatorType): void {
  const start = out.ctx.currentTime;
  notes.forEach((note, i) => {
    tone(out.ctx, out.sounds, {
      wave,
      from: midiToHz(note),
      at: start + i * gap,
      duration: gap * 2.5,
      volume: 0.35,
    });
  });
}

/** Four rows at once: a short "meow", a buzzy tone that rises and falls through an opening filter. */
function meow(out: Output): void {
  const { ctx } = out;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(520, t);
  osc.frequency.exponentialRampToValueAtTime(820, t + 0.16);
  osc.frequency.exponentialRampToValueAtTime(430, t + 0.55);
  filter.type = 'lowpass';
  filter.Q.value = 6;
  filter.frequency.setValueAtTime(700, t);
  filter.frequency.exponentialRampToValueAtTime(2600, t + 0.18);
  filter.frequency.exponentialRampToValueAtTime(800, t + 0.55);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.4, t + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
  osc.connect(filter).connect(gain).connect(out.sounds);
  osc.start(t);
  osc.stop(t + 0.65);
}

type Glide = Pick<ToneSpec, 'wave' | 'from' | 'to' | 'duration'>;

/** One short tone starting now, gliding from one pitch to another. */
function glide(out: Output, spec: Glide): void {
  tone(out.ctx, out.sounds, { ...spec, at: out.ctx.currentTime, volume: 0.45 });
}

function playEvent(out: Output, event: GameEvent): void {
  switch (event.type) {
    case 'rotate':
      glide(out, { wave: 'triangle', from: 880, to: 1040, duration: 0.06 });
      break;
    case 'lock':
      glide(out, { wave: 'sine', from: 190, to: 120, duration: 0.09 });
      break;
    case 'hardDrop':
      glide(out, { wave: 'triangle', from: 420, to: 90, duration: 0.16 });
      break;
    case 'linesCleared':
      if (event.count >= 4) meow(out);
      else arpeggio(out, [84, 88, 91, 96].slice(0, event.count + 1), 0.06, 'sine');
      break;
    case 'levelUp':
      arpeggio(out, [79, 84, 88, 91, 96], 0.07, 'triangle');
      break;
    case 'gameOver':
      arpeggio(out, [79, 76, 72, 67, 60], 0.16, 'triangle');
      break;
  }
}

export function createAudio(): GameAudio {
  let out: Output | null = null;
  let failed = false;
  let musicOn = true;
  let soundsOn = true;

  /** Runs `use` with a working output; any audio error silences the game for good. */
  const withOutput = (use: (output: Output) => void): void => {
    if (out === null || failed) return;
    try {
      use(out);
    } catch {
      failed = true;
    }
  };

  return {
    unlock() {
      if (failed) return;
      try {
        out ??= createOutput();
        if (out?.ctx.state === 'suspended') void out.ctx.resume();
      } catch {
        failed = true;
      }
    },
    setEnabled(music, sounds) {
      musicOn = music;
      soundsOn = sounds;
    },
    play(event) {
      if (soundsOn) withOutput((o) => playEvent(o, event));
    },
    menu() {
      if (soundsOn) withOutput((o) => glide(o, { wave: 'sine', from: 660, to: 700, duration: 0.05 }));
    },
    setMusic(playing, tempo) {
      withOutput((o) => {
        o.music.setTempo(tempo);
        if (playing && musicOn) o.music.play();
        else o.music.stop();
      });
    },
    rewindMusic() {
      withOutput((o) => o.music.rewind());
    },
  };
}
