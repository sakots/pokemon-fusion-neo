import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { MaskEditor } from './MaskEditor';
import type { Raster } from '../../scripts/fusion-materials';
vi.mock('./RasterCanvas', () => ({ RasterCanvas: ({ label, onPoint }: { label: string; onPoint?: (x: number, y: number) => void }) =>
  <button onClick={() => onPoint?.(43, 52)}>{label}</button> }));
const original = PNG.sync.read(readFileSync('public/assets/pokemon/1.png'));
it('1025種類を探せ、既存定義のプレビューと不正JSONによる保存制御を行う', async () => {
  render(<MaskEditor loadRaster={async () => original} />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'JSONを保存' })).toBeEnabled());
  expect(screen.getByText('頭のプレビュー')).toBeInTheDocument();
  const editor = screen.getByLabelText('部位定義JSON');
  const saved = (editor as HTMLTextAreaElement).value;
  fireEvent.change(editor, { target: { value: '{' } });
  expect(screen.getByRole('button', { name: 'JSONを保存' })).toBeDisabled();
  expect(screen.getByRole('alert')).toBeInTheDocument();
  fireEvent.change(editor, { target: { value: saved } });
  expect(screen.getByRole('button', { name: 'JSONを保存' })).toBeEnabled();
  fireEvent.change(screen.getByLabelText('クリックの用途'), { target: { value: 'bodyAnchor' } });
  fireEvent.click(screen.getByText('元画像'));
  expect(JSON.parse((editor as HTMLTextAreaElement).value).bodyAnchor).toEqual({ x: 43, y: 52 });
  fireEvent.change(screen.getByLabelText('番号・名前で検索'), { target: { value: '１０２５' } });
  expect(screen.getByRole('option', { name: /1025.*モモワロウ/ })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('編集対象'), { target: { value: '1025' } });
  await waitFor(() => expect(JSON.parse((editor as HTMLTextAreaElement).value).id).toBe(1025));
  expect(screen.getByRole('button', { name: 'JSONを保存' })).toBeDisabled();
});
it('対象変更後は前の読込結果を反映せず、現在の読込失敗を表示する', async () => {
  let complete!: (source: Raster) => void;
  const load = vi.fn().mockImplementationOnce(() => new Promise<Raster>(resolve => { complete = resolve; }))
    .mockRejectedValueOnce(new Error('画像を読み込めません'));
  render(<MaskEditor loadRaster={load} />);
  fireEvent.change(screen.getByLabelText('編集対象'), { target: { value: '4' } });
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('画像を読み込めません'));
  await act(async () => complete(original));
  expect(screen.getByRole('alert')).toHaveTextContent('画像を読み込めません');
  expect(screen.getByRole('button', { name: 'JSONを保存' })).toBeDisabled();
});
