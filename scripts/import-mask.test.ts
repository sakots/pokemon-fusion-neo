// @vitest-environment node
import { afterEach, expect, it } from 'vitest';
import { mkdtemp, readFile, writeFile, mkdir, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import masks from '../src/data/fusion-masks.json';
import { importMask } from './import-mask.ts';
const directories: string[] = [];
afterEach(async () => { for (const path of directories.splice(0)) await rm(path, { recursive: true, force: true }); });
it('検証が成功した定義を取り込み、不正な定義では正本を変えない', async () => {
  const root = await mkdtemp(join(tmpdir(), 'fusion-mask-test-'));
  directories.push(root);
  await mkdir(join(root, 'src/data'), { recursive: true });
  await mkdir(join(root, 'public/assets/pokemon'), { recursive: true });
  await copyFile('public/assets/pokemon/1.png', join(root, 'public/assets/pokemon/1.png'));
  await writeFile(join(root, 'src/data/pokemon.json'), JSON.stringify([{ id: 1, spritePath: '/assets/pokemon/1.png' }]));
  const definitions = join(root, 'src/data/fusion-masks.json');
  const input = join(root, 'mask.json');
  await writeFile(definitions, JSON.stringify([masks[0]]));
  await writeFile(input, JSON.stringify({ ...masks[0], leftName: '変更' }));
  await importMask(input, root);
  const saved = await readFile(definitions, 'utf8');
  expect(JSON.parse(saved)[0].leftName).toBe('変更');
  await writeFile(input, JSON.stringify({ ...masks[0], headPalette: [[1, 2, 3], [4, 5, 6]] }));
  await expect(importMask(input, root)).rejects.toThrow();
  expect(await readFile(definitions, 'utf8')).toBe(saved);
});
