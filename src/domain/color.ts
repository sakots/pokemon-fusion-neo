export type Palette = readonly (readonly number[])[];
export interface SkinColors {
  head: Palette;
  body: Palette;
  bodyPixels: readonly number[];
}

export function validatePalette(palette: Palette, minimum: number) {
  if (palette.length < minimum || palette.some(color => color.length !== 3
    || color.some(value => !Number.isInteger(value) || value < 0 || value > 255))
    || new Set(palette.map(color => color.join(','))).size !== palette.length) {
    throw new Error('配色のRGBまたは色数が不正です');
  }
}

function brightness(color: readonly number[]) {
  return color[0] * 299 + color[1] * 587 + color[2] * 114;
}

export function recolorPixels(pixels: Uint8ClampedArray, indexes: readonly number[], from: Palette, to: Palette): Uint8ClampedArray {
  validatePalette(from, 1);
  validatePalette(to, 2);
  if (pixels.length % 4 !== 0 || new Set(indexes).size !== indexes.length
    || indexes.some(index => !Number.isInteger(index) || index < 0 || index >= pixels.length / 4)) {
    throw new Error('RGBAデータまたは変換対象のピクセル番号が不正です');
  }
  const source = [...from].sort((a, b) => brightness(a) - brightness(b));
  const target = [...to].sort((a, b) => brightness(a) - brightness(b));
  const replacements = new Map(source.map((color, index) => [color.join(','), target[
    source.length === 1 ? Math.floor(target.length / 2) : Math.round(index * (target.length - 1) / (source.length - 1))
  ]]));
  const result = new Uint8ClampedArray(pixels);
  for (const index of indexes) {
    const offset = index * 4;
    if (pixels[offset + 3] === 0) continue;
    const key = pixels.subarray(offset, offset + 3).join(',');
    const replacement = replacements.get(key);
    if (!replacement) throw new Error('指定ピクセルが変換元の配色と一致しません');
    result.set(replacement, offset);
  }
  return result;
}
