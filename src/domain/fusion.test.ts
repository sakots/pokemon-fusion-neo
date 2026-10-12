import { expect, test } from 'vitest';
import { fusionName, layoutFusion } from './fusion';

const head = { width: 12, height: 10, anchor: { x: 6, y: 8 }, connectionWidth: 4 };
const body = { width: 20, height: 18, anchor: { x: 10, y: 2 }, connectionWidth: 8 };

test('接続幅の比を保ち、頭と体の接続点を一致させて領域内に収める', () => {
  const layout = layoutFusion(head, body);
  expect(layout.head.width / head.width).toBeCloseTo(2 * layout.body.width / body.width);
  expect(layout.head.x + head.anchor.x * layout.head.width / head.width)
    .toBeCloseTo(layout.body.x + body.anchor.x * layout.body.width / body.width);
  expect(layout.head.y + head.anchor.y * layout.head.height / head.height)
    .toBeCloseTo(layout.body.y + body.anchor.y * layout.body.height / body.height);
  for (const rectangle of [layout.head, layout.body]) {
    expect(rectangle.x).toBeGreaterThanOrEqual(8);
    expect(rectangle.y).toBeGreaterThanOrEqual(8);
    expect(rectangle.x + rectangle.width).toBeLessThanOrEqual(120);
    expect(rectangle.y + rectangle.height).toBeLessThanOrEqual(120);
  }
});

test.each([
  { width: 0 }, { height: Number.NaN }, { anchor: { x: -1, y: 0 } },
  { anchor: { x: 13, y: 0 } }, { connectionWidth: 0 }, { connectionWidth: Infinity },
])('不正な部位情報を拒否する: %j', (override) => {
  expect(() => layoutFusion({ ...head, ...override }, body)).toThrow();
});

test('大きな素材も余白内に縮小し、縦横比を保つ', () => {
  const big = { ...body, width: 1000, height: 1000, anchor: { x: 500, y: 500 } };
  const layout = layoutFusion(head, big);
  expect(layout.body.width).toBeLessThan(1000);
  expect(layout.body.width).toBeCloseTo(layout.body.height);
  expect(layout.body.x + layout.body.width).toBeLessThanOrEqual(120);
});

test('同種同士は元の名前、異なる種は設定した前半と後半を使う', () => {
  const bulbasaur = { id: 1, name: 'フシギダネ', leftName: 'フシギ', rightName: 'ダネ' };
  const charmander = { id: 4, name: 'ヒトカゲ', leftName: 'ヒト', rightName: 'カゲ' };
  expect(fusionName(bulbasaur, bulbasaur)).toBe('フシギダネ');
  expect(fusionName(bulbasaur, charmander)).toBe('フシギカゲ');
  expect(fusionName(charmander, bulbasaur)).toBe('ヒトダネ');
});
