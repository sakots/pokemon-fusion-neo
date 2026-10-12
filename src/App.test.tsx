import { render, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from './App';

vi.mock('./fusion/render', () => ({ renderFusion: vi.fn(async () => document.createElement('canvas')) }));

test('6種類・36通りの試作で、配色調整と全種対応が未完了であることを伝える', async () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { level: 1, name: 'ポケモンフュージョン Neo' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('試作：6種類');
  expect(screen.getByRole('status')).toHaveTextContent('配色は調整前');
  expect(screen.getByRole('status')).toHaveTextContent('1025種類への対応は準備中');
  const gallery = within(screen.getByRole('region', { name: '36通りの合成結果' }));
  expect(await gallery.findAllByRole('img')).toHaveLength(36);
  expect(gallery.getAllByRole('figure')).toHaveLength(36);
});
