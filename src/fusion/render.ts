import { layoutFusion } from '../domain/fusion';
import type { FusionPokemon } from '../domain/fusion';

function loadImage(path: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`画像を読み込めません: ${path}`));
    image.src = path;
  });
}

export async function renderFusion(head: FusionPokemon, body: FusionPokemon): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvasを利用できません');
  if (head.id === body.id) {
    const original = await loadImage(head.originalPath);
    canvas.width = original.naturalWidth;
    canvas.height = original.naturalHeight;
    context.drawImage(original, 0, 0);
    return canvas;
  }
  const layout = layoutFusion(head.head, body.body);
  const [headImage, bodyImage] = await Promise.all([loadImage(head.head.path), loadImage(body.body.path)]);
  if (headImage.naturalWidth !== head.head.width || headImage.naturalHeight !== head.head.height
    || bodyImage.naturalWidth !== body.body.width || bodyImage.naturalHeight !== body.body.height) {
    throw new Error('素材の寸法が部位情報と一致しません');
  }
  canvas.width = 128;
  canvas.height = 128;
  context.imageSmoothingEnabled = false;
  for (const [image, rectangle] of [[bodyImage, layout.body], [headImage, layout.head]] as const) {
    context.drawImage(image, rectangle.x, rectangle.y, rectangle.width, rectangle.height);
  }
  return canvas;
}
