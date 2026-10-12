import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Pokemon } from '../src/domain/pokemon.ts';
import { validateAssets, validateCatalog } from './pokemon-data.ts';
import { DATA_DIR, printIssues, readSprite } from './data-files.ts';

async function main() {
  const pokemon: unknown = JSON.parse(await readFile(join(DATA_DIR, 'pokemon.json'), 'utf8'));
  const issues = validateCatalog(pokemon);
  if (issues.length) {
    printIssues(issues);
    process.exitCode = 1;
    return;
  }
  const assets = await validateAssets(pokemon as Pokemon[], readSprite);
  if (assets.issues.length) {
    printIssues(assets.issues);
    process.exitCode = 1;
    return;
  }
  console.log(`全国図鑑1〜1025: 一覧1025件・元画像${assets.validCount}枚が検証を通りました。`);
  console.log('画像寸法:', JSON.stringify(assets.dimensions));
  console.log('部位素材は pnpm validate:fusion で別に検証してください。');
}

main().catch((error: unknown) => {
  printIssues([{ id: null, message: error instanceof Error ? error.message : String(error) }]);
  process.exitCode = 1;
});
