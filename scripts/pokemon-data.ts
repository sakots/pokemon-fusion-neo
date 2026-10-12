import { parse } from 'csv-parse/sync';
import { PNG } from 'pngjs';
import type { Pokemon } from '../src/domain/pokemon.ts';

export const DEX_IDS = Array.from({ length: 1025 }, (_, index) => index + 1);

export interface DataIssue {
  id: number | null;
  message: string;
}

export interface CsvSources {
  languages: string;
  species: string;
  names: string;
  pokemon: string;
}

function readCsv(text: string, requiredColumns: string[]): Record<string, string>[] {
  return parse(text, {
    bom: true,
    skip_empty_lines: true,
    columns(header: string[]) {
      for (const column of requiredColumns) {
        if (!header.includes(column)) throw new Error(`CSVの列がありません: ${column}`);
      }
      return header;
    },
  });
}

export function buildCatalog(csv: CsvSources, expectedIds = DEX_IDS) {
  const languages = readCsv(csv.languages, ['id', 'identifier']);
  const species = readCsv(csv.species, ['id', 'generation_id']);
  const names = readCsv(csv.names, ['pokemon_species_id', 'local_language_id', 'name']);
  const varieties = readCsv(csv.pokemon, ['id', 'species_id', 'is_default']);
  const languageIds = ['ja-hrkt', 'ja'].map(
    (locale) => languages.find((row) => row.identifier === locale)?.id,
  ).filter((id) => id !== undefined);
  const pokemon: Pokemon[] = [];
  const issues: DataIssue[] = [];

  for (const id of [...expectedIds].sort((a, b) => a - b)) {
    const speciesRows = species.filter((row) => Number(row.id) === id);
    if (speciesRows.length !== 1) {
      issues.push({ id, message: speciesRows.length ? '種データが重複しています' : '種データが不足しています' });
      continue;
    }
    const defaults = varieties.filter((row) => Number(row.species_id) === id && row.is_default === '1');
    if (defaults.length !== 1) {
      issues.push({ id, message: defaults.length ? '基本形が重複しています' : '基本形が不足しています' });
      continue;
    }
    const localizedNames = names.filter((row) => Number(row.pokemon_species_id) === id);
    let name = '';
    for (const languageId of languageIds) {
      const matches = localizedNames.filter((row) => row.local_language_id === languageId);
      if (matches.length > 1) issues.push({ id, message: '日本語名が重複しています' });
      if (!name) name = matches[0]?.name.trim() ?? '';
    }
    pokemon.push({
      id, name, generation: Number(speciesRows[0].generation_id),
      pokemonId: Number(defaults[0].id), spritePath: `/assets/pokemon/${id}.png`,
    });
  }
  issues.push(...validateCatalog(pokemon, expectedIds));
  return { pokemon, issues };
}

export function validateCatalog(value: unknown, expectedIds = DEX_IDS): DataIssue[] {
  if (!Array.isArray(value)) return [{ id: null, message: 'ポケモン一覧が配列ではありません' }];
  const issues: DataIssue[] = [];
  const seen = new Set<number>();
  for (const item of value) {
    if (!item || typeof item !== 'object' || !Number.isInteger(item.id)) {
      issues.push({ id: null, message: '図鑑番号が整数ではありません' });
      continue;
    }
    const id: number = item.id;
    if (!expectedIds.includes(id)) issues.push({ id, message: '対象外の図鑑番号です' });
    if (seen.has(id)) issues.push({ id, message: '図鑑番号が重複しています' });
    seen.add(id);
    if (typeof item.name !== 'string' || !item.name.trim()) issues.push({ id, message: '日本語名が不足しています' });
    if (!Number.isInteger(item.generation) || item.generation < 1 || item.generation > 9) {
      issues.push({ id, message: '世代は1〜9の整数が必要です' });
    }
    if (!Number.isInteger(item.pokemonId) || item.pokemonId <= 0) {
      issues.push({ id, message: '基本形のポケモンIDが不正です' });
    }
    if (item.spritePath !== `/assets/pokemon/${id}.png`) {
      issues.push({ id, message: '元画像のパスが図鑑番号に対応していません' });
    }
  }
  for (const id of expectedIds) {
    if (!seen.has(id)) issues.push({ id, message: '図鑑番号が不足しています' });
  }
  return issues;
}

export function inspectSprite(buffer: Buffer) {
  const png = PNG.sync.read(buffer, { checkCRC: true });
  if (png.width <= 0 || png.height <= 0) throw new Error('画像寸法が不正です');
  let visible = false;
  let transparent = false;
  for (let index = 3; index < png.data.length; index += 4) {
    visible ||= png.data[index] > 0;
    transparent ||= png.data[index] < 255;
  }
  if (!visible) throw new Error('全透過の画像です');
  if (!transparent) throw new Error('透過部分がありません');
  return { width: png.width, height: png.height };
}

export async function validateAssets(pokemon: Pokemon[], read: (path: string) => Promise<Buffer>) {
  const issues: DataIssue[] = [];
  const dimensions: Record<string, number> = {};
  let validCount = 0;
  for (const entry of pokemon) {
    try {
      const { width, height } = inspectSprite(await read(entry.spritePath));
      const key = `${width}x${height}`;
      dimensions[key] = (dimensions[key] ?? 0) + 1;
      validCount += 1;
    } catch (error) {
      issues.push({ id: entry.id, message: `元画像: ${error instanceof Error ? error.message : String(error)}` });
    }
  }
  return { issues, dimensions, validCount };
}
