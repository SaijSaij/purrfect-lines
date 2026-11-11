/* global Buffer, console, process */
// Joins the frames written by scripts/screenshots.spec.ts into one animated
// PNG (APNG) for the README. Uses only Node itself: the compressed image data
// of each frame is copied as it is, nothing is decoded or encoded again.
//
// Frame files are named "<index>-<milliseconds since the first frame>.png".
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { crc32 } from 'node:zlib';

const FRAMES = 'test-results/screenshots/apng-frames';
const OUTPUT = 'docs/images/gameplay.apng.png';
/** How long the last frame stays before the animation starts again. */
const LAST_FRAME_MS = 1500;
const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function readChunks(file) {
  const data = readFileSync(file);
  if (!data.subarray(0, 8).equals(SIGNATURE)) throw new Error(`${file} is not a PNG`);
  const chunks = [];
  for (let offset = 8; offset < data.length; ) {
    const length = data.readUInt32BE(offset);
    const type = data.toString('latin1', offset + 4, offset + 8);
    chunks.push({ type, data: data.subarray(offset + 8, offset + 8 + length) });
    offset += 12 + length;
  }
  return chunks;
}

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'latin1');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])) >>> 0, 0);
  return Buffer.concat([head, data, crc]);
}

function uint32s(...values) {
  const buffer = Buffer.alloc(values.length * 4);
  values.forEach((value, i) => buffer.writeUInt32BE(value, i * 4));
  return buffer;
}

/** fcTL: frame size, position 0/0, delay in ms, no dispose, no blending. */
function frameControl(sequence, width, height, delayMs) {
  const tail = Buffer.alloc(6);
  tail.writeUInt16BE(delayMs, 0);
  tail.writeUInt16BE(1000, 2);
  return chunk('fcTL', Buffer.concat([uint32s(sequence, width, height, 0, 0), tail]));
}

const files = existsSync(FRAMES)
  ? readdirSync(FRAMES)
      .filter((name) => name.endsWith('.png'))
      .sort()
  : [];
if (files.length === 0) {
  console.error(`No frames in ${FRAMES}. Run the screenshot tests first.`);
  process.exit(1);
}
const times = files.map((name) => Number(name.split('-')[1]?.replace('.png', '')));
const frames = files.map((name) => readChunks(join(FRAMES, name)));
const header = frames[0].find((c) => c.type === 'IHDR').data;
const width = header.readUInt32BE(0);
const height = header.readUInt32BE(4);

const parts = [SIGNATURE, chunk('IHDR', header), chunk('acTL', uint32s(frames.length, 0))];
let sequence = 0;
frames.forEach((chunks, i) => {
  if (!chunks.find((c) => c.type === 'IHDR').data.equals(header)) {
    throw new Error(`${files[i]} differs in size or color type from the first frame`);
  }
  const next = times[i + 1];
  const delay = next === undefined ? LAST_FRAME_MS : next - times[i];
  parts.push(frameControl(sequence++, width, height, Math.min(delay, 65535)));
  for (const { type, data } of chunks) {
    if (type !== 'IDAT') continue;
    // The first frame doubles as the still image; the others use fdAT.
    parts.push(i === 0 ? chunk('IDAT', data) : chunk('fdAT', Buffer.concat([uint32s(sequence++), data])));
  }
});
parts.push(chunk('IEND', Buffer.alloc(0)));
writeFileSync(OUTPUT, Buffer.concat(parts));
console.log(`Wrote ${OUTPUT}: ${frames.length} frames, ${width} × ${height}.`);
