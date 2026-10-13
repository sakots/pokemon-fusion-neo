// @vitest-environment node
import { expect, test } from 'vitest';
import masks from '../src/data/fusion-masks.json';
import parts from '../src/data/fusion-parts.json';
import catalog from '../src/data/pokemon.json';
import { layoutFusion } from '../src/domain/fusion.ts';

test('第1世代151種類の部位と名前分割を欠番・重複なく揃える', () => {
  const ids = Array.from({ length: 151 }, (_, index) => index + 1);
  expect(masks.map(mask => mask.id)).toEqual(ids);
  expect(parts.map(entry => entry.id)).toEqual(ids);
  for (const entry of parts) {
    expect(entry.leftName + entry.rightName).toBe(catalog.find(pokemon => pokemon.id === entry.id)?.name);
    expect(entry.colors.bodyPixels.length).toBeGreaterThan(0);
  }
});
test('151種類の全22801組み合わせで接続計算が成功し、出力の余白に収まる', () => {
  expect(parts).toHaveLength(151);
  for (const head of parts) for (const body of parts) {
    const layout = layoutFusion(head.head, body.body);
    for (const rect of [layout.head, layout.body]) {
      expect(rect.x).toBeGreaterThanOrEqual(8 - 1e-8);
      expect(rect.y).toBeGreaterThanOrEqual(8 - 1e-8);
      expect(rect.x + rect.width).toBeLessThanOrEqual(120 + 1e-8);
      expect(rect.y + rect.height).toBeLessThanOrEqual(120 + 1e-8);
    }
  }
});
