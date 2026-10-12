import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { PNG } from 'pngjs';
import { fusionMasks } from '../src/data/fusion-masks.ts';
import type { FusionPart, FusionPokemon } from '../src/domain/fusion.ts';
import type { Pokemon } from '../src/domain/pokemon.ts';
import { extractParts } from './fusion-materials.ts';
import { DATA_DIR, ROOT, printIssues, readSprite } from './data-files.ts';
import { inspectSprite, validateCatalog } from './pokemon-data.ts';
import type { DataIssue } from './pokemon-data.ts';

async function main() {
  const check = process.argv.includes('--check');
  const value: unknown = JSON.parse(await readFile(join(DATA_DIR, 'pokemon.json'), 'utf8'));
  const issues: DataIssue[] = validateCatalog(value);
  if (issues.length) { printIssues(issues); process.exitCode = 1; return; }
  const catalog = value as Pokemon[];
  const entries: FusionPokemon[] = [];
  if (!check) await mkdir(join(ROOT, 'public/assets/fusion'), { recursive: true });
  if (new Set(fusionMasks.map(mask => mask.id)).size !== fusionMasks.length) throw new Error('試作対象が重複しています');
  for (const mask of fusionMasks) {
    try {
      const pokemon = catalog.find(entry => entry.id === mask.id);
      if (!pokemon) throw new Error('試作対象の元データがありません');
      if (!mask.leftName.trim() || !mask.rightName.trim()) throw new Error('名前の分割がありません');
      const original = PNG.sync.read(await readSprite(pokemon.spritePath));
      const parts = extractParts(original, mask);
      const generated: FusionPart[] = [];
      for (const kind of ['head', 'body'] as const) {
        const { width, height, data, anchor, connectionWidth } = parts[kind];
        const path = `/assets/fusion/${mask.id}-${kind}.png`;
        const png = new PNG({ width, height });
        png.data = Buffer.from(data);
        const encoded = PNG.sync.write(png);
        inspectSprite(encoded);
        if (check) {
          const savedBuffer = await readSprite(path);
          inspectSprite(savedBuffer);
          const saved = PNG.sync.read(savedBuffer);
          if (saved.width !== width || saved.height !== height || !saved.data.equals(png.data)) {
            throw new Error(`${kind}のPNGがマスク定義と一致しません`);
          }
        } else await writeFile(join(ROOT, 'public', path), encoded);
        generated.push({ path, width, height, anchor, connectionWidth });
      }
      entries.push({
        id: pokemon.id, name: pokemon.name, leftName: mask.leftName, rightName: mask.rightName,
        originalPath: pokemon.spritePath, head: generated[0], body: generated[1],
      });
    } catch (error) {
      issues.push({ id: mask.id, message: error instanceof Error ? error.message : String(error) });
    }
  }
  if (issues.length) { printIssues(issues); process.exitCode = 1; return; }
  const metadata = join(DATA_DIR, 'fusion-parts.json');
  if (check) {
    const saved: unknown = JSON.parse(await readFile(metadata, 'utf8'));
    if (!isDeepStrictEqual(saved, entries)) throw new Error('部位情報がマスク定義と一致しません');
    console.log(`${entries.length}種類・${entries.length * 2}枚の部位素材と接続情報が検証を通りました。`);
  } else {
    await writeFile(metadata, JSON.stringify(entries, null, 2) + '\n');
    console.log(`${entries.length}種類の頭・体の素材を生成しました。`);
  }
}

main().catch((error: unknown) => {
  printIssues([{ id: null, message: error instanceof Error ? error.message : String(error) }]);
  process.exitCode = 1;
});
