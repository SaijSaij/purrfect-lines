// The cat touches of the look (A35): a paw print on every block and a cat
// head next to the title. Both are drawn in code, without image files.
// With file extension, because vite.config.ts loads this file for the favicon (A55).
import { PALETTE } from './palette.ts';

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
const CAT_VIEW_BOX = '0 0 100 90';

/** One SVG shape: its tag and its attributes. */
type Shape = readonly [tag: string, attributes: Readonly<Record<string, string | number>>];

/** Ears, face, eyes, nose and mouth in a 100 × 90 box. */
const CAT_FACE: readonly Shape[] = [
  ['polygon', { points: '14,44 20,4 46,26', fill: CAT.fur }],
  ['polygon', { points: '86,44 80,4 54,26', fill: CAT.fur }],
  ['polygon', { points: '21,34 23,15 37,27', fill: CAT.innerEar }],
  ['polygon', { points: '79,34 77,15 63,27', fill: CAT.innerEar }],
  ['ellipse', { cx: 50, cy: 54, rx: 38, ry: 32, fill: CAT.fur }],
  ['ellipse', { cx: 36, cy: 50, rx: 4.5, ry: 6.5, fill: CAT.eye }],
  ['ellipse', { cx: 64, cy: 50, rx: 4.5, ry: 6.5, fill: CAT.eye }],
  ['polygon', { points: '45,62 55,62 50,68', fill: CAT.nose }],
  [
    'path',
    {
      d: 'M50 68 Q46 74 41 71 M50 68 Q54 74 59 71',
      fill: 'none',
      stroke: CAT.eye,
      'stroke-width': 2,
      'stroke-linecap': 'round',
    },
  ],
];

/** Three whiskers on each side, given for the left side and mirrored. */
const WHISKERS: readonly Shape[] = (
  [
    [30, 62, 4, 56],
    [30, 66, 3, 67],
    [30, 70, 5, 78],
  ] as const
)
  .flatMap(([x1, y1, x2, y2]) => [
    { x1, y1, x2, y2 },
    { x1: 100 - x1, y1, x2: 100 - x2, y2 },
  ])
  .map((line): Shape => ['line', { ...line, stroke: CAT.whisker, 'stroke-width': 1.5, 'stroke-linecap': 'round' }]);

const CAT_HEAD: readonly Shape[] = [...CAT_FACE, ...WHISKERS];

/** A cat head as an SVG element, `heightEm` high so it scales with the screens (A31). */
export function catHeadSvg(heightEm: number): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', CAT_VIEW_BOX);
  svg.setAttribute('aria-hidden', 'true');
  Object.assign(svg.style, { height: `${heightEm}em`, width: `${(heightEm * 100) / 90}em`, display: 'block' });
  for (const [tag, attributes] of CAT_HEAD) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, String(value));
    svg.append(el);
  }
  return svg;
}

/**
 * The same cat head as SVG text, without the DOM, for the favicon that
 * vite.config.ts puts into index.html (A55).
 */
export function catHeadMarkup(): string {
  const shapes = CAT_HEAD.map(([tag, attributes]) => {
    const list = Object.entries(attributes).map(([name, value]) => `${name}="${String(value)}"`);
    return `<${tag} ${list.join(' ')}/>`;
  });
  return `<svg xmlns="${SVG_NS}" viewBox="${CAT_VIEW_BOX}">${shapes.join('')}</svg>`;
}
