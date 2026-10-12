// @vitest-environment node
import { PNG } from 'pngjs';
import { describe, expect, test } from 'vitest';
import { buildCatalog, inspectSprite, validateAssets, validateCatalog } from './pokemon-data.ts';

const csv = {
  languages: 'id,identifier\n1,ja-hrkt\n11,ja\n9,en\n',
  species: 'id,generation_id\n2,1\n1,1\n1026,9\n',
  names: 'pokemon_species_id,local_language_id,name\n1,11,漢字名\n1,1,フシギダネ\n2,11,フシギソウ\n',
  pokemon: 'id,species_id,is_default\n10001,1,0\n1,1,1\n20002,2,1\n',
};
const catalog = [
  { id: 1, name: 'フシギダネ', generation: 1, pokemonId: 1, spritePath: '/assets/pokemon/1.png' },
  { id: 2, name: 'フシギソウ', generation: 1, pokemonId: 20002, spritePath: '/assets/pokemon/2.png' },
];

function sprite(alpha: 'mixed' | 'opaque' | 'transparent' = 'mixed') {
  const png = new PNG({ width: 2, height: 2 });
  png.data.fill(alpha === 'transparent' ? 0 : 255);
  if (alpha === 'mixed') png.data[3] = 0;
  return PNG.sync.write(png);
}

describe('公開CSVからの一覧生成', () => {
  test('日本語の優先順位と基本形IDを保ち、対象の種だけを番号順に返す', () => {
    expect(buildCatalog(csv, [1, 2])).toEqual({ pokemon: catalog, issues: [] });
  });

  test.each([
    ['種データの重複', { species: csv.species + '1,1\n' }, 1],
    ['日本語名の欠落', { names: 'pokemon_species_id,local_language_id,name\n1,9,Bulbasaur\n' }, 1],
    ['名前の重複', { names: csv.names + '1,1,フシギダネ\n' }, 1],
    ['基本形の欠落', { pokemon: 'id,species_id,is_default\n1,1,0\n20002,2,1\n' }, 1],
    ['基本形の重複', { pokemon: csv.pokemon + '3,1,1\n' }, 1],
  ])('%sを番号付きで報告する', (_label, override, id) => {
    const result = buildCatalog({ ...csv, ...override }, [1, 2]);
    expect(result.issues).toContainEqual({ id, message: expect.any(String) });
  });

  test('CSVの必要な列がなければ失敗する', () => {
    expect(() => buildCatalog({ ...csv, species: 'id,wrong\n1,1\n' }, [1])).toThrow('generation_id');
  });
});

describe('一覧の検証', () => {
  test('対象番号の一覧を受け入れる', () => {
    expect(validateCatalog(catalog, [1, 2])).toEqual([]);
  });

  test('欠番、重複、範囲外をまとめて報告する', () => {
    const issues = validateCatalog([catalog[0], catalog[0], { ...catalog[1], id: 3 }], [1, 2]);
    expect(issues).toEqual(expect.arrayContaining([
      { id: 1, message: expect.stringContaining('重複') },
      { id: 2, message: expect.stringContaining('不足') },
      { id: 3, message: expect.stringContaining('対象外') },
    ]));
  });

  test.each([
    { id: 1.5 }, { name: ' ' }, { generation: 10 }, { pokemonId: 0 },
    { spritePath: '/assets/pokemon/../2.png' },
  ])('不正な項目を拒否する: %j', (override) => {
    expect(validateCatalog([{ ...catalog[0], ...override }], [1]).length).toBeGreaterThan(0);
  });

  test.each([{ value: null }, { value: {} }, { value: [null] }])('一覧として扱えない値を拒否する: %j', ({ value }) => {
    expect(validateCatalog(value, [1]).length).toBeGreaterThan(0);
  });
});

describe('PNGと画像の不足検証', () => {
  test('透過と可視部分を持つPNGの寸法を取得する', () => {
    expect(inspectSprite(sprite())).toEqual({ width: 2, height: 2 });
  });

  test.each([Buffer.from('not a PNG'), sprite('opaque'), sprite('transparent')])(
    '壊れた画像、透過のない画像、全透過の画像を拒否する', (buffer) => {
      expect(() => inspectSprite(buffer)).toThrow();
    },
  );

  test('不足と復号失敗を両方報告し、他の画像の検査も続ける', async () => {
    const result = await validateAssets(catalog, async (path) => {
      if (path.endsWith('/1.png')) throw new Error('画像がありません');
      return Buffer.from('broken');
    });
    expect(result.issues.map((issue) => issue.id)).toEqual([1, 2]);
    expect(result.validCount).toBe(0);
  });
});
