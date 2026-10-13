import { useLayoutEffect, useRef } from 'react';
import type { Raster } from '../../scripts/fusion-materials';
import type { MaskGeometry } from '../../scripts/mask-definition';

export function RasterCanvas({ source, label, mask, onPoint }: {
  source: Raster; label: string; mask?: MaskGeometry; onPoint?: (x: number, y: number) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const canvas = ref.current!;
    canvas.width = source.width; canvas.height = source.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pixels = ctx.createImageData(source.width, source.height);
    pixels.data.set(source.data); ctx.putImageData(pixels, 0, 0);
    if (!mask) return;
    const polygon = (points: readonly (readonly number[])[], color: string) => {
      if (!points.length) return;
      ctx.strokeStyle = color; ctx.lineWidth = 0.5; ctx.beginPath();
      points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.closePath(); ctx.stroke();
      ctx.fillStyle = color;
      points.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, .6, 0, Math.PI * 2); ctx.fill(); });
    };
    polygon(mask.headPolygon, '#0000ff');
    mask.patches.forEach(patch => polygon(patch.polygon, '#ff0066'));
    mask.bodyProtectedPolygons.forEach(points => polygon(points, '#900090'));
    for (const [anchor, color] of [[mask.headAnchor, '#0000ff'], [mask.bodyAnchor, '#ff0066']] as const) {
      ctx.strokeStyle = color; ctx.beginPath(); ctx.moveTo(anchor.x - 2, anchor.y); ctx.lineTo(anchor.x + 2, anchor.y);
      ctx.moveTo(anchor.x, anchor.y - 2); ctx.lineTo(anchor.x, anchor.y + 2); ctx.stroke();
    }
  }, [source, mask]);
  return <figure><figcaption>{label}</figcaption><canvas ref={ref} role="img" aria-label={label}
    onClick={event => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) * source.width / rect.width);
      const y = Math.floor((event.clientY - rect.top) * source.height / rect.height);
      if (x >= 0 && y >= 0 && x < source.width && y < source.height) onPoint?.(x, y);
    }} /></figure>;
}
