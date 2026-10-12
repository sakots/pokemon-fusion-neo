import { expect, test } from 'vitest';
import { randomPokemon, searchPokemon } from './selection';

const pokemon = [{ id: 25, name: 'ピカチュウ' }, { id: 4, name: 'ヒトカゲ' }, { id: 1, name: 'フシギダネ' }];

test.each([' ぴか ', 'ﾋﾟｶ', 'ピカ'])('表記を揃えて名前を部分一致で検索する: %s', query => {
  expect(searchPokemon(pokemon, query)).toEqual([pokemon[0]]);
});
test.each(['1', '0001', '０００１'])('番号を完全一致で検索する: %s', query => {
  expect(searchPokemon(pokemon, query)).toEqual([pokemon[2]]);
});
test('空の検索は番号順で全件を返し、対象外の番号や名前は0件になる', () => {
  expect(searchPokemon(pokemon, ' ')).toEqual([pokemon[2], pokemon[1], pokemon[0]]);
  expect(searchPokemon(pokemon, '2')).toEqual([]);
  expect(searchPokemon(pokemon, 'ミュウ')).toEqual([]);
  expect(pokemon[0].id).toBe(25);
});
test('ランダムで先頭と末尾を選べる', () => {
  expect(randomPokemon(pokemon, () => 0)).toBe(pokemon[0]);
  expect(randomPokemon(pokemon, () => 0.999999)).toBe(pokemon[2]);
});
test('空の選択肢や範囲外の乱数を拒否する', () => {
  expect(() => randomPokemon([], () => 0)).toThrow();
  expect(() => randomPokemon(pokemon, () => 1)).toThrow();
  expect(() => randomPokemon(pokemon, () => -1)).toThrow();
});
