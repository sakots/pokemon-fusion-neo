// @vitest-environment node
import { expect, test } from 'vitest';
import masks from '../src/data/fusion-masks.json';
import parts from '../src/data/fusion-parts.json';
import catalog from '../src/data/pokemon.json';
import { layoutFusion } from '../src/domain/fusion.ts';

test('第1〜第7世代809種類の部位と名前分割を欠番・重複なく揃える', () => {
  const ids = Array.from({ length: 809 }, (_, index) => index + 1);
  expect(masks.map(mask => mask.id)).toEqual(ids);
  expect(parts.map(entry => entry.id)).toEqual(ids);
  for (const entry of parts) {
    expect(entry.leftName + entry.rightName).toBe(catalog.find(pokemon => pokemon.id === entry.id)?.name);
  }
});
test('809種類の全654481組み合わせで接続計算が成功し、出力の余白に収まる', () => {
  expect(parts).toHaveLength(809);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const head of parts) for (const body of parts) {
    const layout = layoutFusion(head.head, body.body);
    for (const rect of [layout.head, layout.body]) {
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    }
  }
  expect(minX).toBeGreaterThanOrEqual(8 - 1e-8);
  expect(minY).toBeGreaterThanOrEqual(8 - 1e-8);
  expect(maxX).toBeLessThanOrEqual(120 + 1e-8);
  expect(maxY).toBeLessThanOrEqual(120 + 1e-8);
});
