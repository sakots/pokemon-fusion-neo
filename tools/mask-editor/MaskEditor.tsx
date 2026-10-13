import { useEffect, useMemo, useState } from 'react';
import catalog from '../../src/data/pokemon.json';
import definitions from '../../src/data/fusion-masks.json';
import { searchPokemon } from '../../src/domain/selection';
import { parseMask, prepareMask, readGeometry } from '../../scripts/mask-definition';
import type { MaskDefinition } from '../../scripts/mask-definition';
import type { Raster } from '../../scripts/fusion-materials';
import { RasterCanvas } from './RasterCanvas';

async function loadOriginal(path: string): Promise<Raster> {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve(); image.onerror = () => reject(new Error('元画像を読み込めません。再読込してください。'));
    image.src = path;
  });
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvasを使えません');
  ctx.drawImage(image, 0, 0);
  return { width: canvas.width, height: canvas.height, data: ctx.getImageData(0, 0, canvas.width, canvas.height).data };
}
function initialMask(id: number) {
  return definitions.find(mask => mask.id === id) ?? {
    id, leftName: '', rightName: '', headPolygon: [], headAnchor: { x: 48, y: 48 }, bodyAnchor: { x: 48, y: 48 },
    headConnectionWidth: 12, bodyConnectionWidth: 12, patches: [], headPalette: [], bodyPalette: [], bodyProtectedPolygons: [],
  };
}
const serialize = (value: unknown) => JSON.stringify(value, null, 2);
export function MaskEditor({ loadRaster = loadOriginal }: { loadRaster?: (path: string) => Promise<Raster> }) {
  const [id, setId] = useState(1);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState(() => serialize(initialMask(1)));
  const [mode, setMode] = useState('headPolygon');
  const [loaded, setLoaded] = useState<{ id: number; source: Raster } | null>(null);
  const [failure, setFailure] = useState('');
  const pokemon = catalog.find(entry => entry.id === id)!;
  const candidates = searchPokemon(catalog, query);
  const source = loaded?.id === id ? loaded.source : null;
  useEffect(() => {
    let active = true;
    setFailure(''); setLoaded(null);
    loadRaster(pokemon.spritePath).then(source => { if (active) setLoaded({ id: pokemon.id, source }); })
      .catch((error: unknown) => { if (active) setFailure(error instanceof Error ? error.message : String(error)); });
    return () => { active = false; };
  }, [pokemon, loadRaster]);
  const validation = useMemo(() => {
    try {
      const mask = parseMask(JSON.parse(draft));
      if (mask.id !== id) throw new Error('JSONの番号が編集対象と異なります');
      if (!source) return { error: '', mask, result: null };
      return { error: '', mask, result: prepareMask(source, mask) };
    } catch (error) { return { error: error instanceof Error ? error.message : String(error), mask: null, result: null }; }
  }, [draft, id, source]);
  const geometry = useMemo(() => {
    try { return readGeometry(JSON.parse(draft)); } catch { return null; }
  }, [draft]);
  function click(x: number, y: number) {
    if (!source) return;
    try {
      const mask = JSON.parse(draft) as MaskDefinition;
      if (mode === 'headAnchor' || mode === 'bodyAnchor') mask[mode] = { x, y };
      else if (mode === 'headPolygon') mask.headPolygon = [...mask.headPolygon, [x, y]];
      else {
        const offset = (y * source.width + x) * 4;
        if (!source.data[offset + 3]) return;
        const color = Array.from(source.data.subarray(offset, offset + 3));
        const key = mode === 'headPalette' ? 'headPalette' : 'bodyPalette';
        if (!mask[key].some(existing => existing.join(',') === color.join(','))) mask[key] = [...mask[key], color];
      }
      setDraft(serialize(mask));
    } catch { /* 構造が不正な間はJSON欄で修正する。 */ }
  }
  function save() {
    if (!validation.result || !validation.mask || failure) return;
    const url = URL.createObjectURL(new Blob([serialize(validation.mask) + '\n'], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `fusion-mask-${id}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const error = failure || validation.error;
  return <main className="app mask-editor">
    <h1>部位定義の編集</h1>
    <p>定義済み {definitions.length}/1025種類。対象の変更で編集中の内容を破棄します。先にJSONを保存してください。</p>
    <label>番号・名前で検索<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label>
    <label>編集対象<select value={id} onChange={event => {
      const next = Number(event.target.value); setId(next); setDraft(serialize(initialMask(next)));
    }}>
      {!candidates.some(entry => entry.id === id) && <option value={id}>No.{id} {pokemon.name}（選択中）</option>}
      {candidates.map(entry => <option key={entry.id} value={entry.id}>No.{entry.id} {entry.name}{definitions.some(mask => mask.id === entry.id) ? '（定義済み）' : ''}</option>)}
    </select></label>
    <p role="status">検索結果 {candidates.length}種類</p>
    <label>クリックの用途<select value={mode} onChange={event => setMode(event.target.value)}>
      <option value="headPolygon">頭の多角形に点を追加</option><option value="headAnchor">頭の接続点</option>
      <option value="bodyAnchor">体の接続点</option><option value="headPalette">頭の皮膚色を追加</option><option value="bodyPalette">体の皮膚色を追加</option>
    </select></label>
    <p>青線は頭、赤線は補完領域、紫線は保護領域。十字は接続点です。接続幅・名前・補完領域・保護領域はJSON欄で編集します。</p>
    <div className="editor-images">
      {source ? <RasterCanvas source={source} label="元画像" mask={geometry ?? undefined} onPoint={click} /> : !failure && <p>元画像を読み込み中…</p>}
      {validation.result && <><RasterCanvas source={validation.result.parts.head} label="頭のプレビュー" />
        <RasterCanvas source={validation.result.parts.body} label="体のプレビュー" /></>}
    </div>
    <label>部位定義JSON<textarea spellCheck={false} value={draft} onChange={event => setDraft(event.target.value)} /></label>
    {error && <p role="alert">{error}</p>}
    <button type="button" disabled={!validation.result || !!failure} onClick={save}>JSONを保存</button>
    <p>保存後に <code>pnpm import:mask ファイルのパス</code>、<code>pnpm prepare:fusion</code>、<code>pnpm validate:fusion</code> を実行し、異種との合成結果を確認してください。</p>
    <a href="/">合体画面へ</a>
  </main>;
}
