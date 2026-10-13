import { extractParts, extractColorPixels } from './fusion-materials.ts';
import type { FusionMask, Raster } from './fusion-materials.ts';
import { validatePalette, recolorPixels } from '../src/domain/color.ts';
import type { Palette } from '../src/domain/color.ts';

export interface MaskDefinition extends FusionMask {
  leftName: string;
  rightName: string;
  headPalette: Palette;
  bodyPalette: Palette;
  bodyProtectedPolygons: readonly (readonly (readonly number[])[])[];
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function point(value: unknown) {
  return record(value) && typeof value.x === 'number' && Number.isFinite(value.x)
    && typeof value.y === 'number' && Number.isFinite(value.y);
}
function polygon(value: unknown, minimum = 3) {
  return Array.isArray(value) && value.length >= minimum && value.every(vertex => Array.isArray(vertex)
    && vertex.length === 2 && vertex.every(coordinate => typeof coordinate === 'number' && Number.isFinite(coordinate)));
}
export type MaskGeometry = Pick<MaskDefinition, 'headPolygon' | 'headAnchor' | 'bodyAnchor' | 'patches' | 'bodyProtectedPolygons'>;
export function readGeometry(value: unknown): MaskGeometry | null {
  if (!record(value) || !point(value.headAnchor) || !point(value.bodyAnchor) || !polygon(value.headPolygon, 0)
    || !Array.isArray(value.patches) || !value.patches.every(patch => record(patch) && polygon(patch.polygon)
      && Array.isArray(patch.color) && patch.color.length === 4
      && patch.color.every(channel => Number.isInteger(channel) && channel >= 0 && channel <= 255))
    || !Array.isArray(value.bodyProtectedPolygons) || !value.bodyProtectedPolygons.every(value => polygon(value))) return null;
  return value as unknown as MaskGeometry;
}
export function parseMask(value: unknown): MaskDefinition {
  if (!record(value) || !Number.isInteger(value.id) || Number(value.id) < 1 || Number(value.id) > 1025
    || typeof value.leftName !== 'string' || !value.leftName.trim()
    || typeof value.rightName !== 'string' || !value.rightName.trim()
    || typeof value.headConnectionWidth !== 'number' || !Number.isFinite(value.headConnectionWidth)
    || typeof value.bodyConnectionWidth !== 'number' || !Number.isFinite(value.bodyConnectionWidth)
    || !readGeometry(value) || !polygon(value.headPolygon)
    || !Array.isArray(value.headPalette) || !value.headPalette.every(Array.isArray)
    || !Array.isArray(value.bodyPalette) || !value.bodyPalette.every(Array.isArray)) {
    throw new Error('部位定義の構造・番号・名前が不正です');
  }
  const mask = value as unknown as MaskDefinition;
  validatePalette(mask.headPalette, 2);
  validatePalette(mask.bodyPalette, 1);
  return mask;
}
export function prepareMask(source: Raster, mask: MaskDefinition) {
  const parts = extractParts(source, mask);
  const colors = new Set<string>();
  for (let index = 0; index < parts.head.data.length; index += 4) {
    if (parts.head.data[index + 3]) colors.add(parts.head.data.subarray(index, index + 3).join(','));
  }
  if (mask.headPalette.some(color => !colors.has(color.join(',')))) throw new Error('頭の指定色が素材にありません');
  const bodyPixels = extractColorPixels(source, parts.body, mask);
  recolorPixels(parts.body.data, bodyPixels, mask.bodyPalette, mask.headPalette);
  return { parts, bodyPixels };
}
export function mergeMask(existing: readonly unknown[], incoming: unknown): MaskDefinition[] {
  const masks = existing.map(parseMask);
  if (new Set(masks.map(mask => mask.id)).size !== masks.length) throw new Error('部位定義の番号が重複しています');
  const mask = parseMask(incoming);
  return [...masks.filter(entry => entry.id !== mask.id), mask].sort((a, b) => a.id - b.id);
}
