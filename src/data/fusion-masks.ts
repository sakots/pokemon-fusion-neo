import type { FusionMask } from '../../scripts/fusion-materials.ts';

export const fusionMasks: (FusionMask & { leftName: string; rightName: string })[] = [
  {
    id: 1, leftName: 'フシギ', rightName: 'ダネ',
    headPolygon: [[27, 36], [36, 33], [49, 35], [51, 44], [46, 54], [30, 54], [27, 48]],
    headAnchor: { x: 43, y: 52 }, bodyAnchor: { x: 43, y: 52 }, headConnectionWidth: 12, bodyConnectionWidth: 12,
    patches: [{ polygon: [[36, 48], [47, 47], [51, 52], [45, 57], [36, 55]], color: [71, 173, 139, 255] }],
  },
  {
    id: 4, leftName: 'ヒト', rightName: 'カゲ',
    headPolygon: [[32, 29], [49, 29], [51, 40], [46, 47], [32, 47]],
    headAnchor: { x: 42, y: 46 }, bodyAnchor: { x: 42, y: 47 }, headConnectionWidth: 10, bodyConnectionWidth: 10,
    patches: [{ polygon: [[39, 44], [46, 44], [48, 50], [38, 50]], color: [239, 139, 66, 255] }],
  },
  {
    id: 23, leftName: 'アー', rightName: 'ボ',
    headPolygon: [[28, 29], [47, 27], [52, 39], [52, 46], [42, 51], [35, 51], [35, 43], [29, 41]],
    headAnchor: { x: 45, y: 49 }, bodyAnchor: { x: 45, y: 49 }, headConnectionWidth: 10, bodyConnectionWidth: 10,
    patches: [{ polygon: [[40, 45], [50, 45], [51, 53], [40, 53]], color: [164, 83, 157, 255] }],
  },
  {
    id: 25, leftName: 'ピカ', rightName: 'チュウ',
    headPolygon: [[30, 23], [42, 23], [42, 31], [53, 29], [62, 30], [55, 39], [53, 44], [51, 49], [32, 49]],
    headAnchor: { x: 42, y: 48 }, bodyAnchor: { x: 42, y: 49 }, headConnectionWidth: 12, bodyConnectionWidth: 12,
    patches: [{ polygon: [[35, 46], [49, 46], [51, 53], [34, 53]], color: [247, 205, 65, 255] }],
  },
  {
    id: 81, leftName: 'コ', rightName: 'イル',
    headPolygon: [[36, 35], [46, 35], [45, 41], [54, 41], [57, 46], [56, 55], [50, 59], [40, 59], [37, 54], [37, 45]],
    headAnchor: { x: 47, y: 55 }, bodyAnchor: { x: 47, y: 53 }, headConnectionWidth: 12, bodyConnectionWidth: 12,
    patches: [{ polygon: [[40, 46], [51, 46], [54, 51], [50, 58], [40, 58], [36, 52]], color: [113, 145, 139, 255] }],
  },
  {
    id: 102, leftName: 'タマ', rightName: 'タマ',
    headPolygon: [[38, 36], [49, 36], [55, 42], [55, 48], [51, 50], [50, 60], [41, 60], [37, 53], [37, 43]],
    headAnchor: { x: 45, y: 58 }, bodyAnchor: { x: 45, y: 55 }, headConnectionWidth: 14, bodyConnectionWidth: 14,
    patches: [{ polygon: [[39, 49], [53, 49], [53, 59], [40, 61]], color: [244, 160, 133, 255] }],
  },
];
