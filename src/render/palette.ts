// All colors in one place (A35): a warm palette of dark browns and cream.
// The pieces avoid the colors they usually have in the genre; a few muted
// cool tones (teal, sage, plum) keep the seven pieces apart.
import type { PieceType } from '../game/pieces';

export const PIECE_COLORS: Readonly<Record<PieceType, string>> = {
  I: '#c4583e', // terracotta
  O: '#b8477a', // raspberry
  T: '#d9a23f', // mustard
  S: '#2f7f78', // teal
  Z: '#7f7d22', // olive
  L: '#7d4c96', // plum
  J: '#9cc48f', // light sage
};

export const PALETTE = {
  page: '#1a1310',
  frame: '#e6d3b3',
  field: '#2a1f1a',
  sidebar: '#211915',
  overlay: 'rgba(26, 19, 16, 0.75)',
  /** Background of the start, pause and game over screens; opaque so the field is hidden (A23). */
  screen: '#2a1f1a',
  /** Full rows light up in this color before they disappear (A16). */
  flash: '#fff6e8',
  /** The chosen menu entry. */
  highlight: '#f0b45a',
  text: '#fff6e8',
  label: '#c2ab92',
  /** The paw print on every block, drawn over the piece color. */
  paw: 'rgba(255, 246, 232, 0.32)',
  /** The cat head next to the title on the start screen. */
  cat: {
    fur: '#e9a35a',
    innerEar: '#f4c9a6',
    eye: '#2a1f1a',
    nose: '#d9707a',
    whisker: '#fff6e8',
  },
} as const;

/** Opacity of the ghost piece outline (A14). */
export const GHOST_ALPHA = 0.7;
