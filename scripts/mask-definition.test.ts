// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { PNG } from 'pngjs';
import { readFile } from 'node:fs/promises';
import fusionMasks from '../src/data/fusion-masks.json';
import { parseMask, prepareMask, mergeMask, readGeometry } from './mask-definition.ts';

describe('部位定義の編集・取込', () => {
  it.each(fusionMasks)('No.$idの頭・体と色の対象を作れる', async value => {
    const mask = parseMask(value);
    const source = PNG.sync.read(await readFile(`public/assets/pokemon/${mask.id}.png`));
    const result = prepareMask(source, mask);
    expect(result.bodyPixels.length).toBeGreaterThan(0);
    expect(result.parts.head.width).toBeGreaterThan(0);
  });
  it.each([null, {}, { ...fusionMasks[0], id: 1026 }, { ...fusionMasks[0], headAnchor: null },
    { ...fusionMasks[0], patches: [{}] }, { ...fusionMasks[0], leftName: ' ' },
    { ...fusionMasks[0], bodyProtectedPolygons: [null] }])('不正な構造を拒否する: %j', value => {
    expect(() => parseMask(value)).toThrow();
  });
  it('名前や配色が未入力でも作図でき、不正な座標は描画しない', () => {
    expect(readGeometry({ ...fusionMasks[0], leftName: '', headPalette: [], headPolygon: [[27, 36]] })?.headPolygon).toEqual([[27, 36]]);
    expect(readGeometry({ ...fusionMasks[0], headPolygon: [[NaN, 36]] })).toBeNull();
  });
  it('存在しない頭の色と範囲外の座標を拒否する', async () => {
    const source = PNG.sync.read(await readFile('public/assets/pokemon/1.png'));
    expect(() => prepareMask(source, { ...fusionMasks[0], headPalette: [[1, 2, 3], [4, 5, 6]] })).toThrow();
    expect(() => prepareMask(source, { ...fusionMasks[0], headAnchor: { x: 97, y: 52 } })).toThrow();
  });
  it('追加と置換を番号順に返し、元の一覧を変更しない', () => {
    const charmander = fusionMasks.find(mask => mask.id === 4)!;
    const original = [charmander, fusionMasks[0]];
    const replacement = { ...fusionMasks[0], leftName: 'テスト' };
    expect(mergeMask(original, replacement)).toEqual([replacement, charmander]);
    expect(mergeMask(original, { ...fusionMasks[0], id: 7 }).map(mask => mask.id)).toEqual([1, 4, 7]);
    expect(original[1].leftName).toBe('フシギ');
    expect(() => mergeMask([fusionMasks[0], fusionMasks[0]], replacement)).toThrow();
  });
});
