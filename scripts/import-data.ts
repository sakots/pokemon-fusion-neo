import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildCatalog, inspectSprite, validateAssets } from './pokemon-data.ts';
import type { CsvSources, DataIssue } from './pokemon-data.ts';
import { DATA_DIR, ROOT, isMissingFile, printIssues, readSprite } from './data-files.ts';

const dataRevision = 'c80757193bd0889054e36f4209762360bdaa4b95';
const spriteRevision = '0dc105d5b12416932f29b594078282ab4be045f5';
const csvBase = `https://raw.githubusercontent.com/PokeAPI/pokeapi/${dataRevision}/data/v2/csv`;
const spriteBase = `https://raw.githubusercontent.com/PokeAPI/sprites/${spriteRevision}`;
const cacheDir = join(ROOT, '.cache/pokeapi', dataRevision);

async function download(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function cachedFile(path: string, url: string) {
  try {
    return await readFile(path);
  } catch (error) {
    if (!isMissingFile(error)) throw error;
    const buffer = await download(url);
    await writeFile(path, buffer);
    return buffer;
  }
}

async function main() {
  await mkdir(cacheDir, { recursive: true });
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(join(ROOT, 'public/assets/pokemon'), { recursive: true });
  const files = {
    languages: 'languages.csv', species: 'pokemon_species.csv',
    names: 'pokemon_species_names.csv', pokemon: 'pokemon.csv',
  };
  const csv = {} as CsvSources;
  for (const [key, filename] of Object.entries(files)) {
    csv[key as keyof CsvSources] = (await cachedFile(join(cacheDir, filename), `${csvBase}/${filename}`)).toString('utf8');
  }
  const { pokemon, issues } = buildCatalog(csv);
  if (issues.length) {
    await saveReport(pokemon.length, 0, {}, issues);
    printIssues(issues);
    process.exitCode = 1;
    return;
  }

  const licence = await cachedFile(join(ROOT, 'public/assets/pokemon/LICENCE.txt'), `${spriteBase}/LICENCE.txt`);
  if (!licence.toString('utf8').includes('The Pokémon Company')) throw new Error('素材の出典表記を確認できません');

  let next = 0;
  let completed = 0;
  const failedIds = new Set<number>();
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (next < pokemon.length) {
      const entry = pokemon[next++];
      try {
        const path = join(ROOT, 'public', entry.spritePath);
        try {
          await readFile(path);
        } catch (error) {
          if (!isMissingFile(error)) throw error;
          const buffer = await download(`${spriteBase}/sprites/pokemon/${entry.pokemonId}.png`);
          inspectSprite(buffer);
          await writeFile(path, buffer);
        }
      } catch (error) {
        failedIds.add(entry.id);
        issues.push({ id: entry.id, message: error instanceof Error ? error.message : String(error) });
      }
      completed += 1;
      if (completed % 100 === 0 || completed === pokemon.length) console.log(`元画像の取得: ${completed}/${pokemon.length}`);
    }
  }));
  const assets = await validateAssets(pokemon.filter((entry) => !failedIds.has(entry.id)), readSprite);
  issues.push(...assets.issues);
  issues.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  await saveReport(pokemon.length, assets.validCount, assets.dimensions, issues);
  if (issues.length) {
    printIssues(issues);
    process.exitCode = 1;
    return;
  }
  await writeFile(join(DATA_DIR, 'pokemon.json'), JSON.stringify(pokemon, null, 2) + '\n');
  console.log(`一覧${pokemon.length}件・元画像${assets.validCount}枚を保存しました。`);
}

async function saveReport(catalogCount: number, spriteCount: number, dimensions: Record<string, number>, issues: DataIssue[]) {
  await writeFile(join(DATA_DIR, 'import-report.json'), JSON.stringify({
    importedAt: new Date().toISOString(),
    sources: { csvBase, spriteBase, dataRevision, spriteRevision, spriteSeries: 'sprites/pokemon' },
    catalogCount, spriteCount, dimensions, issues,
  }, null, 2) + '\n');
}

main().catch(async (error: unknown) => {
  const issues = [{ id: null, message: error instanceof Error ? error.message : String(error) }];
  printIssues(issues);
  try {
    await saveReport(0, 0, {}, issues);
  } catch (reportError) {
    console.error('取得レポートを保存できません:', reportError);
  }
  process.exitCode = 1;
});
