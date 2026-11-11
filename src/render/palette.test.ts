import { describe, expect, it } from 'vitest';
import { PIECE_TYPES, type PieceType } from '../game/pieces';
import { PIECE_COLORS } from './palette';

/** Hue in degrees (0–360) of a color written as #rrggbb. */
function hueOf(hex: string): number {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (match === null) throw new Error(`not a #rrggbb color: ${hex}`);
  const [r, g, b] = match.slice(1, 4).map((part) => parseInt(part, 16) / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  if (delta === 0) return 0;
  let hue: number;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  return (hue * 60 + 360) % 360;
}

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
}

/** The color each piece usually has in the genre (A35 rules these out). */
const GENRE_HUES: Record<PieceType, { name: string; hue: number }> = {
  I: { name: 'light blue', hue: 190 },
  O: { name: 'yellow', hue: 55 },
  T: { name: 'purple', hue: 290 },
  S: { name: 'green', hue: 120 },
  Z: { name: 'red', hue: 0 },
  L: { name: 'orange', hue: 30 },
  J: { name: 'blue', hue: 230 },
};

/** Hues closer than this to the genre color count as that color. */
const MIN_HUE_DISTANCE = 40;

const SOURCES = import.meta.glob<string>(['/src/**/*.ts', '/index.html'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

describe('A35 own design', () => {
  it('gives every piece its own color', () => {
    const colors = PIECE_TYPES.map((type) => PIECE_COLORS[type].toLowerCase());
    expect(new Set(colors).size).toBe(PIECE_TYPES.length);
  });

  it.each(PIECE_TYPES)('does not give piece %s the color it usually has in the genre', (type) => {
    const { name, hue } = GENRE_HUES[type];
    const distance = hueDistance(hueOf(PIECE_COLORS[type]), hue);
    expect(distance, `${type} is ${PIECE_COLORS[type]}, too close to ${name}`).toBeGreaterThanOrEqual(
      MIN_HUE_DISTANCE,
    );
  });

  it('defines every color in palette.ts only', () => {
    const colorLiteral = /#[0-9a-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i;
    const offenders = Object.entries(SOURCES)
      .filter(([path]) => !path.endsWith('/render/palette.ts') && !path.endsWith('.test.ts'))
      .filter(([, source]) => colorLiteral.test(source))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });

  it('draws everything in code, without image files', () => {
    const imageFile = /\.(?:png|jpe?g|gif|webp|svg|bmp|ico|avif)\b/i;
    const offenders = Object.entries(SOURCES)
      .filter(([path]) => !path.endsWith('.test.ts'))
      .filter(([, source]) => imageFile.test(source))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });
});
