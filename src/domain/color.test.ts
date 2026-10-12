import { expect, test } from 'vitest';
import { recolorPixels } from './color';

const from = [[160, 80, 20], [80, 40, 10], [240, 160, 60]];
const to = [[120, 240, 180], [20, 60, 40], [60, 160, 100]];

test('明暗の順に皮膚色を置換し、元のデータを変えない', () => {
  const source = new Uint8ClampedArray([80, 40, 10, 255, 160, 80, 20, 255, 240, 160, 60, 255]);
  expect([...recolorPixels(source, [0, 1, 2], from, to)]).toEqual([
    20, 60, 40, 255, 60, 160, 100, 255, 120, 240, 180, 255,
  ]);
  expect([...source.slice(0, 4)]).toEqual([80, 40, 10, 255]);
  expect(from[0]).toEqual([160, 80, 20]);
});

test('同じRGBでも対象外の領域を保ち、透過とアルファ値も保つ', () => {
  const source = new Uint8ClampedArray([160, 80, 20, 128, 160, 80, 20, 255, 160, 80, 20, 0, 16, 16, 16, 255]);
  const result = recolorPixels(source, [0, 2], from, to);
  expect([...result]).toEqual([60, 160, 100, 128, 160, 80, 20, 255, 160, 80, 20, 0, 16, 16, 16, 255]);
});

test('1色の変換元は変換先の中央の段階を使う', () => {
  expect([...recolorPixels(new Uint8ClampedArray([160, 80, 20, 255]), [0], [from[0]], to)])
    .toEqual([60, 160, 100, 255]);
});

test.each([
  { colors: [] }, { colors: [[-1, 0, 0]] }, { colors: [[256, 0, 0]] },
  { colors: [[1.5, 0, 0]] }, { colors: [[1, 2]] }, { colors: [from[0], from[0]] },
])('不正な変換元を拒否する: %j', ({ colors }) => {
  expect(() => recolorPixels(new Uint8ClampedArray(4), [], colors, to)).toThrow();
});

test('不正な変換先、ピクセル番号、RGBA長、指定色との不一致を拒否する', () => {
  const pixels = new Uint8ClampedArray([160, 80, 20, 255]);
  expect(() => recolorPixels(pixels, [0], from, [to[0]])).toThrow();
  expect(() => recolorPixels(pixels, [1], from, to)).toThrow();
  expect(() => recolorPixels(pixels, [-1], from, to)).toThrow();
  expect(() => recolorPixels(pixels, [0.5], from, to)).toThrow();
  expect(() => recolorPixels(new Uint8ClampedArray(3), [], from, to)).toThrow();
  expect(() => recolorPixels(new Uint8ClampedArray([1, 2, 3, 255]), [0], from, to)).toThrow();
});
