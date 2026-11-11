// The cat touches of the look (A35): a paw print on every block and a cat
// head next to the title. Both are drawn in code, without image files.
import { PALETTE } from './palette';

/**
 * A small paw print in the middle of a square of `size` whose top left corner
 * is at (`left`, `top`): one pad and four toes.
 */
export function drawPaw(ctx: CanvasRenderingContext2D, left: number, top: number, size: number): void {
  const cx = left + size / 2;
  const cy = top + size / 2;
  ctx.fillStyle = PALETTE.paw;
  ctx.beginPath();
  ctx.ellipse(cx, cy + size * 0.12, size * 0.16, size * 0.13, 0, 0, Math.PI * 2);
  const toes: [number, number][] = [
    [-0.21, -0.04],
    [-0.08, -0.19],
    [0.08, -0.19],
    [0.21, -0.04],
  ];
  for (const [dx, dy] of toes) {
    const x = cx + dx * size;
    const y = cy + dy * size;
    ctx.moveTo(x + size * 0.065, y);
    ctx.ellipse(x, y, size * 0.065, size * 0.08, 0, 0, Math.PI * 2);
  }
  ctx.fill();
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const CAT = PALETTE.cat;

function svgShape(tag: string, attributes: Record<string, string | number>): SVGElement {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, String(value));
  return el;
}

/** Ears, face, eyes, nose and mouth in a 100 × 90 box. */
function catFace(): SVGElement[] {
  return [
    svgShape('polygon', { points: '14,44 20,4 46,26', fill: CAT.fur }),
    svgShape('polygon', { points: '86,44 80,4 54,26', fill: CAT.fur }),
    svgShape('polygon', { points: '21,34 23,15 37,27', fill: CAT.innerEar }),
    svgShape('polygon', { points: '79,34 77,15 63,27', fill: CAT.innerEar }),
    svgShape('ellipse', { cx: 50, cy: 54, rx: 38, ry: 32, fill: CAT.fur }),
    svgShape('ellipse', { cx: 36, cy: 50, rx: 4.5, ry: 6.5, fill: CAT.eye }),
    svgShape('ellipse', { cx: 64, cy: 50, rx: 4.5, ry: 6.5, fill: CAT.eye }),
    svgShape('polygon', { points: '45,62 55,62 50,68', fill: CAT.nose }),
    svgShape('path', {
      d: 'M50 68 Q46 74 41 71 M50 68 Q54 74 59 71',
      fill: 'none',
      stroke: CAT.eye,
      'stroke-width': 2,
      'stroke-linecap': 'round',
    }),
  ];
}

/** Three whiskers on each side, given for the left side and mirrored. */
function whiskers(): SVGElement[] {
  const left: [number, number, number, number][] = [
    [30, 62, 4, 56],
    [30, 66, 3, 67],
    [30, 70, 5, 78],
  ];
  const both = left.flatMap(([x1, y1, x2, y2]) => [
    { x1, y1, x2, y2 },
    { x1: 100 - x1, y1, x2: 100 - x2, y2 },
  ]);
  return both.map((line) =>
    svgShape('line', { ...line, stroke: CAT.whisker, 'stroke-width': 1.5, 'stroke-linecap': 'round' }),
  );
}

/** A cat head as an SVG element, `heightEm` high so it scales with the screens (A31). */
export function catHeadSvg(heightEm: number): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 90');
  svg.setAttribute('aria-hidden', 'true');
  svg.id = 'cat-head';
  Object.assign(svg.style, { height: `${heightEm}em`, width: `${(heightEm * 100) / 90}em`, display: 'block' });
  svg.append(...catFace(), ...whiskers());
  return svg;
}
