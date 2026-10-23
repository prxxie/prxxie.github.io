#!/usr/bin/env node
/**
 * US-LAUNCH-001: the share card. A raster image written from code so the build
 * never depends on a designer's export — cream field, coral band, ink rule.
 *
 * 1200×630 is the size every social crawler expects.
 */
import { deflateSync } from "node:zlib";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WIDTH = 1200;
const HEIGHT = 630;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public/og.png");

const CANVAS = [250, 249, 245];
const PRIMARY = [204, 120, 92];
const INK = [20, 20, 19];

/** The colour of one pixel: a cream field with a coral band and three ink rules. */
function pixel(x, y) {
  if (y > 470 && y < 520) return PRIMARY;
  if (y === 120 || y === 150 || y === 180) return x > 96 && x < 1104 ? INK : CANVAS;
  if (x < 96 || x >= 1104 || y < 48 || y >= 582) return INK;

  return CANVAS;
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));

  return Buffer.concat([length, body, crc]);
}

const raw = Buffer.alloc((WIDTH * 3 + 1) * HEIGHT);

for (let y = 0; y < HEIGHT; y += 1) {
  const rowStart = y * (WIDTH * 3 + 1);
  raw[rowStart] = 0;

  for (let x = 0; x < WIDTH; x += 1) {
    const [r, g, b] = pixel(x, y);
    const offset = rowStart + 1 + x * 3;
    raw[offset] = r;
    raw[offset + 1] = g;
    raw[offset + 2] = b;
  }
}

const header = Buffer.alloc(13);
header.writeUInt32BE(WIDTH, 0);
header.writeUInt32BE(HEIGHT, 4);
header[8] = 8;
header[9] = 2;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", header),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, png);
console.log(`og image: ${WIDTH}×${HEIGHT}, ${png.length} bytes → public/og.png`);
