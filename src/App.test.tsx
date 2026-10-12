import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import App from './App';
import { renderFusion } from './fusion/render';

vi.mock('./fusion/render', () => ({ renderFusion: vi.fn(async () => document.createElement('canvas')) }));

afterEach(() => { vi.restoreAllMocks(); });

test('6種類の試作と初期の頭・体・合体結果を伝える', async () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { level: 1, name: 'ポケモンフュージョン Neo' }),
  ).toBeInTheDocument();
  const notice = screen.getByRole('region', { name: '試作の状況' });
  expect(notice).toHaveTextContent('試作：6種類');
  expect(notice).toHaveTextContent('形や配色は調整中');
  expect(notice).toHaveTextContent('1025種類への対応は準備中');
  expect(within(screen.getByRole('region', { name: '頭' })).getByRole('button', { name: 'No.0001 フシギダネ' })).toHaveAttribute('aria-pressed', 'true');
  expect(within(screen.getByRole('region', { name: '体' })).getByRole('button', { name: 'No.0004 ヒトカゲ' })).toHaveAttribute('aria-pressed', 'true');
  expect(await within(screen.getByRole('region', { name: '合体結果' })).findByRole('img')).toHaveAccessibleName('フシギカゲ');
});

test('配色は初期状態で合わせ、切り替えても選択と検索語を維持する', async () => {
  render(<App />);
  const toggle = screen.getByRole('checkbox', { name: '体の色を頭に合わせる' });
  expect(toggle).toBeChecked();
  fireEvent.change(screen.getByRole('searchbox', { name: '頭を検索' }), { target: { value: '1' } });
  await screen.findByRole('img', { name: 'フシギカゲ' });
  fireEvent.click(toggle);
  expect(toggle).not.toBeChecked();
  expect(await screen.findByRole('img', { name: 'フシギカゲ' })).toBeInTheDocument();
  expect(vi.mocked(renderFusion)).toHaveBeenLastCalledWith(expect.objectContaining({ id: 1 }), expect.objectContaining({ id: 4 }), false);
  fireEvent.click(screen.getByRole('button', { name: '頭と体を交換' }));
  expect(await screen.findByRole('img', { name: 'ヒトダネ' })).toBeInTheDocument();
  vi.spyOn(Math, 'random').mockReturnValueOnce(0.999999).mockReturnValueOnce(0);
  fireEvent.click(screen.getByRole('button', { name: '両方をランダム' }));
  expect(await screen.findByRole('img', { name: 'タマダネ' })).toBeInTheDocument();
  expect(toggle).not.toBeChecked();
  expect(vi.mocked(renderFusion)).toHaveBeenLastCalledWith(expect.objectContaining({ id: 102 }), expect.objectContaining({ id: 1 }), false);
  expect(screen.getByRole('searchbox', { name: '頭を検索' })).toHaveValue('1');
});

test('かな・半角の検索で候補を選び、0件でも選択と結果を維持する', async () => {
  render(<App />);
  fireEvent.change(screen.getByRole('searchbox', { name: '頭を検索' }), { target: { value: 'ﾋﾟｶ' } });
  const head = within(screen.getByRole('region', { name: '頭' }));
  fireEvent.click(head.getByRole('button', { name: 'No.0025 ピカチュウ' }));
  expect(await screen.findByRole('img', { name: 'ピカカゲ' })).toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox', { name: '頭を検索' }), { target: { value: 'ミュウ' } });
  expect(head.getByRole('status')).toHaveTextContent('該当するポケモンがありません');
  expect(screen.getByRole('img', { name: 'ピカカゲ' })).toBeInTheDocument();
  expect(head.getByText('選択中：No.0025 ピカチュウ')).toBeInTheDocument();
});

test('番号で体を選び、同種同士は元の名前を使う', async () => {
  render(<App />);
  fireEvent.change(screen.getByRole('searchbox', { name: '体を検索' }), { target: { value: '０００１' } });
  fireEvent.click(within(screen.getByRole('region', { name: '体' })).getByRole('button', { name: 'No.0001 フシギダネ' }));
  expect(await screen.findByRole('img', { name: 'フシギダネ' })).toBeInTheDocument();
});

test('交換を2回行うと元に戻り、検索語はその欄に残る', async () => {
  render(<App />);
  const search = screen.getByRole('searchbox', { name: '頭を検索' });
  fireEvent.change(search, { target: { value: '1' } });
  fireEvent.click(screen.getByRole('button', { name: '頭と体を交換' }));
  expect(await screen.findByRole('img', { name: 'ヒトダネ' })).toBeInTheDocument();
  expect(search).toHaveValue('1');
  fireEvent.click(screen.getByRole('button', { name: '頭と体を交換' }));
  expect(await screen.findByRole('img', { name: 'フシギカゲ' })).toBeInTheDocument();
});

test('ランダムは検索結果に関係なく片側・両側を選ぶ', async () => {
  const random = vi.spyOn(Math, 'random');
  render(<App />);
  fireEvent.change(screen.getByRole('searchbox', { name: '頭を検索' }), { target: { value: 'ミュウ' } });
  random.mockReturnValue(0.999999);
  fireEvent.click(screen.getByRole('button', { name: '頭をランダム' }));
  expect(await screen.findByRole('img', { name: 'タマカゲ' })).toBeInTheDocument();
  random.mockReturnValue(0);
  fireEvent.click(screen.getByRole('button', { name: '体をランダム' }));
  expect(await screen.findByRole('img', { name: 'タマダネ' })).toBeInTheDocument();
  random.mockReturnValueOnce(0).mockReturnValueOnce(0.999999);
  fireEvent.click(screen.getByRole('button', { name: '両方をランダム' }));
  expect(await screen.findByRole('img', { name: 'フシギタマ' })).toBeInTheDocument();
});
