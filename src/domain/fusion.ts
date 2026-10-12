export interface Point { x: number; y: number }
export interface PartGeometry {
  width: number;
  height: number;
  anchor: Point;
  connectionWidth: number;
}
export interface FusionPart extends PartGeometry { path: string }
export interface FusionPokemon {
  id: number;
  name: string;
  leftName: string;
  rightName: string;
  originalPath: string;
  head: FusionPart;
  body: FusionPart;
}

export function validatePart(part: PartGeometry) {
  if (!Number.isInteger(part.width) || part.width <= 0 || !Number.isInteger(part.height) || part.height <= 0) {
    throw new Error('素材の寸法は正の整数が必要です');
  }
  if (![part.anchor.x, part.anchor.y, part.connectionWidth].every(Number.isFinite)
    || part.anchor.x < 0 || part.anchor.x > part.width || part.anchor.y < 0 || part.anchor.y > part.height
    || part.connectionWidth <= 0 || part.connectionWidth > part.width) {
    throw new Error('接続点または接続幅が不正です');
  }
}

export function layoutFusion(head: PartGeometry, body: PartGeometry) {
  validatePart(head);
  validatePart(body);
  const ratio = body.connectionWidth / head.connectionWidth;
  const headX = body.anchor.x - head.anchor.x * ratio;
  const headY = body.anchor.y - head.anchor.y * ratio;
  const left = Math.min(0, headX);
  const top = Math.min(0, headY);
  const width = Math.max(body.width, headX + head.width * ratio) - left;
  const height = Math.max(body.height, headY + head.height * ratio) - top;
  const fit = Math.min(112 / width, 112 / height);
  const scale = fit >= 1 ? Math.floor(fit) : fit;
  const x = (128 - width * scale) / 2 - left * scale;
  const y = (128 - height * scale) / 2 - top * scale;
  return {
    head: { x: x + headX * scale, y: y + headY * scale, width: head.width * ratio * scale, height: head.height * ratio * scale },
    body: { x, y, width: body.width * scale, height: body.height * scale },
  };
}

export function fusionName(head: Pick<FusionPokemon, 'id' | 'name' | 'leftName' | 'rightName'>, body: Pick<FusionPokemon, 'id' | 'name' | 'leftName' | 'rightName'>) {
  return head.id === body.id ? head.name : head.leftName + body.rightName;
}
