import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DataIssue } from './pokemon-data.ts';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const DATA_DIR = join(ROOT, 'src/data');

export function readSprite(path: string) {
  return readFile(join(ROOT, 'public', path));
}

export function printIssues(issues: DataIssue[]) {
  for (const issue of issues) {
    const label = issue.id === null ? '共通' : `No.${String(issue.id).padStart(4, '0')}`;
    console.error(`${label}: ${issue.message}`);
  }
}

export function isMissingFile(error: unknown) {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}
