function normalizeName(value: string) {
  return value.trim().normalize('NFKC').replace(/[ァ-ヶ]/g, character =>
    String.fromCharCode(character.charCodeAt(0) - 0x60));
}

export function searchPokemon<T extends { id: number; name: string }>(pokemon: readonly T[], query: string): T[] {
  const normalized = normalizeName(query);
  const matches = /^\d+$/.test(normalized)
    ? pokemon.filter(entry => entry.id === Number(normalized))
    : pokemon.filter(entry => normalizeName(entry.name).includes(normalized));
  return matches.sort((a, b) => a.id - b.id);
}

export function randomPokemon<T>(pokemon: readonly T[], random: () => number = Math.random): T {
  const value = random();
  if (!pokemon.length || !Number.isFinite(value) || value < 0 || value >= 1) {
    throw new Error('選択肢または乱数が不正です');
  }
  return pokemon[Math.floor(value * pokemon.length)];
}
