import { readFile, writeFile, rename } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { ROOT, printIssues } from './data-files.ts';
import { mergeMask, prepareMask } from './mask-definition.ts';
import type { Pokemon } from '../src/domain/pokemon.ts';

export async function importMask(input: string, root = ROOT) {
  const destination = join(root, 'src/data/fusion-masks.json');
  const existing: unknown = JSON.parse(await readFile(destination, 'utf8'));
  if (!Array.isArray(existing)) throw new Error('部位定義の一覧が不正です');
  const incoming: unknown = JSON.parse(await readFile(input, 'utf8'));
  const masks = mergeMask(existing, incoming);
  const catalog: Pokemon[] = JSON.parse(await readFile(join(root, 'src/data/pokemon.json'), 'utf8'));
  for (const mask of masks) {
    const pokemon = catalog.find(entry => entry.id === mask.id);
    if (!pokemon) throw new Error(`No.${mask.id}の元データがありません`);
    const source = PNG.sync.read(await readFile(join(root, 'public', pokemon.spritePath)));
    prepareMask(source, mask);
  }
  const temporary = destination + '.tmp';
  await writeFile(temporary, JSON.stringify(masks, null, 2) + '\n');
  await rename(temporary, destination);
  return masks.length;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const input = process.argv[2];
  if (!input) { console.error('使い方: pnpm import:mask /path/to/fusion-mask.json'); process.exitCode = 1; }
  else importMask(input).then(count => console.log(`部位定義を取り込みました。定義済み ${count}/1025種類。pnpm prepare:fusionで素材を生成してください。`))
    .catch((error: unknown) => { printIssues([{ id: null, message: error instanceof Error ? error.message : String(error) }]); process.exitCode = 1; });
}
