// @vitest-environment node
import { expect, test } from 'vitest';
import { extractParts } from './fusion-materials.ts';

const mask = {
  id: 1,
  headPolygon: [[0, 0], [2, 0], [2, 1], [0, 1]],
  headAnchor: { x: 1, y: 1 }, bodyAnchor: { x: 1, y: 1 },
  headConnectionWidth: 2, bodyConnectionWidth: 2,
  patches: [{ polygon: [[0, 0], [1, 0], [1, 1], [0, 1]], color: [0, 255, 0, 255] }],
};
const data = new Uint8ClampedArray(3 * 3 * 4);
data.set([255, 0, 0, 255, 255, 0, 0, 255], 0);
data.set([0, 0, 255, 255], (1 * 3 + 1) * 4);
const source = { width: 3, height: 3, data };

test('頭を切り出して体から除去し、補完と元のピクセルと透過を保つ', () => {
  const before = source.data.slice();
  const { head, body } = extractParts(source, mask);
  const pixels = (part: typeof head) => Array.from({ length: part.data.length / 4 }, (_, index) => [...part.data.slice(index * 4, index * 4 + 4)]);
  expect(pixels(head).filter(pixel => pixel[3] > 0)).toEqual([[255, 0, 0, 255], [255, 0, 0, 255]]);
  expect(pixels(body)).toContainEqual([0, 255, 0, 255]);
  expect(pixels(body)).toContainEqual([0, 0, 255, 255]);
  expect(pixels(body)).not.toContainEqual([255, 0, 0, 255]);
  expect(pixels(head)).toContainEqual([0, 0, 0, 0]);
  expect(source.data).toEqual(before);
});

test('切り出した余白の分だけ接続点を移す', () => {
  const shifted = new Uint8ClampedArray(8 * 8 * 4);
  shifted.set([255, 0, 0, 255], (3 * 8 + 4) * 4);
  shifted.set([0, 0, 255, 255], (6 * 8 + 4) * 4);
  const result = extractParts({ width: 8, height: 8, data: shifted }, {
    ...mask, headPolygon: [[4, 3], [5, 3], [5, 4], [4, 4]], patches: [],
    headAnchor: { x: 4, y: 4 }, bodyAnchor: { x: 4, y: 6 },
  });
  expect(result.head.anchor).toEqual({ x: 1, y: 2 });
  expect(result.head.width).toBe(3);
  expect(result.head.height).toBe(4);
});

test('空の部位や領域外のマスクを拒否する', () => {
  expect(() => extractParts(source, { ...mask, headPolygon: [[2, 2], [3, 2], [3, 3], [2, 3]] })).toThrow();
  expect(() => extractParts(source, { ...mask, headAnchor: { x: 4, y: 4 } })).toThrow();
});
