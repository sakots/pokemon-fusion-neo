import { validatePart } from '../src/domain/fusion.ts';
import type { Point } from '../src/domain/fusion.ts';
import { validatePalette } from '../src/domain/color.ts';
import type { Palette } from '../src/domain/color.ts';

type Polygon = readonly (readonly number[])[];

export function extractColorPixels(source: Raster, body: Raster & { anchor: Point }, mask: FusionMask & {
  bodyPalette: Palette; bodyProtectedPolygons: readonly Polygon[];
}): number[] {
  validatePalette(mask.bodyPalette, 1);
  for (const polygon of mask.bodyProtectedPolygons) validatePolygon(polygon, source.width, source.height);
  const allowed = new Set(mask.bodyPalette.map(color => color.join(',')));
  const found = new Set<string>();
  const indexes: number[] = [];
  const origin = { x: mask.bodyAnchor.x - body.anchor.x, y: mask.bodyAnchor.y - body.anchor.y };
  for (let y = 0; y < body.height; y++) for (let x = 0; x < body.width; x++) {
    const index = y * body.width + x;
    const offset = index * 4;
    const key = body.data.subarray(offset, offset + 3).join(',');
    if (body.data[offset + 3] > 0 && allowed.has(key)
      && !mask.bodyProtectedPolygons.some(polygon => contains(polygon, origin.x + x + 0.5, origin.y + y + 0.5))) {
      indexes.push(index);
      found.add(key);
    }
  }
  if (found.size !== allowed.size) throw new Error('体の指定色が変換対象の領域にありません');
  return indexes;
}
export interface FusionMask {
  id: number;
  headPolygon: Polygon;
  headAnchor: Point;
  bodyAnchor: Point;
  headConnectionWidth: number;
  bodyConnectionWidth: number;
  patches: readonly { polygon: Polygon; color: readonly number[] }[];
}
export interface Raster { width: number; height: number; data: Uint8Array | Uint8ClampedArray }

function contains(polygon: Polygon, x: number, y: number) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function validatePolygon(polygon: Polygon, width: number, height: number) {
  if (polygon.length < 3 || polygon.some(point => point.length !== 2
    || !point.every(Number.isFinite) || point[0] < 0 || point[0] > width || point[1] < 0 || point[1] > height)) {
    throw new Error('部位の多角形が不正です');
  }
}

function crop(source: Raster, anchor: Point, connectionWidth: number) {
  let left = source.width, top = source.height, right = -1, bottom = -1;
  for (let y = 0; y < source.height; y++) for (let x = 0; x < source.width; x++) {
    if (source.data[(y * source.width + x) * 4 + 3] > 0) {
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
  }
  if (right < 0) throw new Error('部位に可視部分がありません');
  left = Math.max(0, Math.min(left, Math.floor(anchor.x)) - 1);
  top = Math.max(0, Math.min(top, Math.floor(anchor.y)) - 1);
  right = Math.min(source.width - 1, Math.max(right, Math.ceil(anchor.x)) + 1);
  bottom = Math.min(source.height - 1, Math.max(bottom, Math.ceil(anchor.y)) + 1);
  const width = right - left + 1, height = bottom - top + 1;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    const start = ((y + top) * source.width + left) * 4;
    data.set(source.data.subarray(start, start + width * 4), y * width * 4);
  }
  const part = { width, height, data, anchor: { x: anchor.x - left, y: anchor.y - top }, connectionWidth };
  validatePart(part);
  return part;
}

export function extractParts(source: Raster, mask: FusionMask) {
  validatePart({ ...source, anchor: mask.headAnchor, connectionWidth: mask.headConnectionWidth });
  validatePart({ ...source, anchor: mask.bodyAnchor, connectionWidth: mask.bodyConnectionWidth });
  if (source.data.length !== source.width * source.height * 4) throw new Error('RGBAデータの長さが不正です');
  validatePolygon(mask.headPolygon, source.width, source.height);
  for (const patch of mask.patches) {
    validatePolygon(patch.polygon, source.width, source.height);
    if (patch.color.length !== 4 || patch.color.some(value => !Number.isInteger(value) || value < 0 || value > 255)) {
      throw new Error('補完色が不正です');
    }
  }
  const head = new Uint8ClampedArray(source.data.length);
  const body = new Uint8ClampedArray(source.data.length);
  for (let y = 0; y < source.height; y++) for (let x = 0; x < source.width; x++) {
    const index = (y * source.width + x) * 4;
    const pixel = source.data.subarray(index, index + 4);
    const inHead = contains(mask.headPolygon, x + 0.5, y + 0.5);
    for (const patch of mask.patches) {
      if (contains(patch.polygon, x + 0.5, y + 0.5)) body.set(patch.color, index);
    }
    if (inHead) head.set(pixel, index);
    else if (pixel[3] > 0) body.set(pixel, index);
  }
  return {
    head: crop({ ...source, data: head }, mask.headAnchor, mask.headConnectionWidth),
    body: crop({ ...source, data: body }, mask.bodyAnchor, mask.bodyConnectionWidth),
  };
}
