// All colors in one place (A35). A plain, distinguishable interim palette;
// the final warm palette follows in a later milestone.
import type { PieceType } from '../game/pieces';

export const PIECE_COLORS: Readonly<Record<PieceType, string>> = {
  I: '#d1495b',
  O: '#edae49',
  T: '#00798c',
  S: '#7a9e4f',
  Z: '#8e5572',
  L: '#e07a5f',
  J: '#3d5a80',
};

export const PALETTE = {
  page: '#17131c',
  frame: '#d8c3a5',
  field: '#241e2b',
  sidebar: '#1d1823',
  overlay: 'rgba(0, 0, 0, 0.7)',
  /** Background of the start, pause and game over screens; opaque so the field is hidden (A23). */
  screen: '#241e2b',
  /** Full rows light up in this color before they disappear (A16). */
  flash: '#fff8f0',
  /** The chosen menu entry. */
  highlight: '#edae49',
  text: '#fff8f0',
  label: '#b9a99a',
} as const;

/** Opacity of the ghost piece outline (A14). */
export const GHOST_ALPHA = 0.55;
