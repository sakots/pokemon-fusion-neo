import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import parts from '../data/fusion-parts.json';
import { renderFusion } from '../fusion/render';
import FusionPreview from './FusionPreview';

vi.mock('../fusion/render', () => ({ renderFusion: vi.fn() }));
const mockedRender = vi.mocked(renderFusion);
beforeEach(() => { mockedRender.mockReset(); });

test('読み込み失敗を表示し、再試行で画像を表示できる', async () => {
  mockedRender.mockRejectedValueOnce(new Error('画像なし')).mockResolvedValueOnce(document.createElement('canvas'));
  render(<FusionPreview head={parts[0]} body={parts[1]} />);
  expect(screen.getByText('読み込み中')).toBeInTheDocument();
  expect(await screen.findByRole('alert')).toHaveTextContent('画像を読み込めませんでした');
  fireEvent.click(screen.getByRole('button', { name: '再試行' }));
  expect(await screen.findByRole('img')).toHaveAccessibleName('フシギカゲ');
});

test('古い組み合わせの遅い描画結果を反映しない', async () => {
  let completeOld!: (canvas: HTMLCanvasElement) => void;
  mockedRender.mockImplementationOnce(() => new Promise(resolve => { completeOld = resolve; }))
    .mockResolvedValueOnce(document.createElement('canvas'));
  const { rerender } = render(<FusionPreview head={parts[0]} body={parts[1]} />);
  rerender(<FusionPreview head={parts[1]} body={parts[0]} />);
  const current = await screen.findByRole('img', { name: 'ヒトダネ' });
  completeOld(document.createElement('canvas'));
  await waitFor(() => expect(screen.getByRole('img')).toBe(current));
});
