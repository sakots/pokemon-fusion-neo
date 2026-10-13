import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import parts from '../data/fusion-parts.json';
import { renderFusion } from '../fusion/render';
import FusionPreview from './FusionPreview';

vi.mock('../fusion/render', () => ({ renderFusion: vi.fn() }));
const charmander = parts.find(entry => entry.id === 4)!;
const mockedRender = vi.mocked(renderFusion);
beforeEach(() => { mockedRender.mockReset(); });

test('読み込み失敗を表示し、再試行で画像を表示できる', async () => {
  mockedRender.mockRejectedValueOnce(new Error('画像なし')).mockResolvedValueOnce(document.createElement('canvas'));
  render(<FusionPreview head={parts[0]} body={charmander} />);
  expect(screen.getByText('読み込み中')).toBeInTheDocument();
  expect(await screen.findByRole('alert')).toHaveTextContent('画像を読み込めませんでした');
  fireEvent.click(screen.getByRole('button', { name: '再試行' }));
  expect(await screen.findByRole('img')).toHaveAccessibleName('フシギカゲ');
});

test('古い組み合わせの遅い描画結果を反映しない', async () => {
  let completeOld!: (canvas: HTMLCanvasElement) => void;
  mockedRender.mockImplementationOnce(() => new Promise(resolve => { completeOld = resolve; }))
    .mockResolvedValueOnce(document.createElement('canvas'));
  const { rerender } = render(<FusionPreview head={parts[0]} body={charmander} />);
  rerender(<FusionPreview head={charmander} body={parts[0]} />);
  const current = await screen.findByRole('img', { name: 'ヒトダネ' });
  await act(async () => { completeOld(document.createElement('canvas')); });
  expect(screen.getByRole('img')).toBe(current);
});

test('古い組み合わせの遅い失敗で現在の画像を上書きしない', async () => {
  let failOld!: (error: Error) => void;
  mockedRender.mockImplementationOnce(() => new Promise((_resolve, reject) => { failOld = reject; }))
    .mockResolvedValueOnce(document.createElement('canvas'));
  const { rerender } = render(<FusionPreview head={parts[0]} body={charmander} />);
  rerender(<FusionPreview head={charmander} body={parts[0]} />);
  const current = await screen.findByRole('img', { name: 'ヒトダネ' });
  await act(async () => { failOld(new Error('遅れた失敗')); });
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.getByRole('img')).toBe(current);
});
