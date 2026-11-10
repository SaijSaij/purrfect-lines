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
  overlay: 'rgba(0, 0, 0, 0.7)',
  text: '#fff8f0',
} as const;
