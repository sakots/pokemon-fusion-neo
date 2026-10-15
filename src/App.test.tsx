import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import App from './App';
import parts from './data/fusion-parts.json';

vi.mock('./fusion/render', () => ({ renderFusion: vi.fn(async () => document.createElement('canvas')) }));

afterEach(() => { vi.restoreAllMocks(); });

test('初期の頭・体の選択と合体結果を伝える', async () => {
  render(<App parts={parts} />);

  expect(screen.getByRole('combobox', { name: '頭を選択' })).toHaveValue('1');
  expect(screen.getByRole('combobox', { name: '体を選択' })).toHaveValue('4');
  expect(await within(screen.getByRole('region', { name: '合体結果' })).findByRole('img')).toHaveAccessibleName('フシギカゲ');
});

test('配色は初期状態で合わせ、切り替えても選択と検索語を維持する', async () => {
  render(<App parts={parts} />);
  const toggle = screen.getByRole('checkbox', { name: '体の色を頭に合わせる' });
  expect(toggle).toBeChecked();
  fireEvent.change(screen.getByRole('searchbox', { name: '頭を検索' }), { target: { value: '1' } });
  await screen.findByRole('img', { name: 'フシギカゲ' });
  fireEvent.click(toggle);
  expect(toggle).not.toBeChecked();
  expect(await screen.findByRole('img', { name: 'フシギカゲ' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '頭と体を交換' }));
  expect(await screen.findByRole('img', { name: 'ヒトダネ' })).toBeInTheDocument();
  vi.spyOn(Math, 'random').mockReturnValueOnce(0.999999).mockReturnValueOnce(0);
  fireEvent.click(screen.getByRole('button', { name: '両方をランダム' }));
  expect(await screen.findByRole('img', { name: 'ゲノダネ' })).toBeInTheDocument();
  expect(toggle).not.toBeChecked();
  expect(screen.getByRole('searchbox', { name: '頭を検索' })).toHaveValue('1');
});

test('かな・半角の検索で候補を選び、0件でも選択と結果を維持する', async () => {
  render(<App parts={parts} />);
  fireEvent.change(screen.getByRole('searchbox', { name: '頭を検索' }), { target: { value: 'ﾋﾟｶ' } });
  const head = within(screen.getByRole('region', { name: '頭' }));
  const select = head.getByRole('combobox', { name: '頭を選択' });
  expect(select).toHaveValue('1');
  expect(head.getByRole('option', { name: 'No.0001 フシギダネ' })).toBeDisabled();
  expect(head.queryByRole('option', { name: 'No.0004 ヒトカゲ' })).not.toBeInTheDocument();
  fireEvent.change(select, { target: { value: '25' } });
  expect(await screen.findByRole('img', { name: 'ピカカゲ' })).toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox', { name: '頭を検索' }), { target: { value: '未対応' } });
  expect(head.getByRole('status')).toHaveTextContent('該当するポケモンがありません');
  expect(screen.getByRole('img', { name: 'ピカカゲ' })).toBeInTheDocument();
  expect(head.getByText('選択中：No.0025 ピカチュウ')).toBeInTheDocument();
  expect(select).toBeDisabled();
  expect(select).toHaveValue('25');
  fireEvent.change(screen.getByRole('searchbox', { name: '頭を検索' }), { target: { value: '' } });
  expect(select).toBeEnabled();
  expect(select).toHaveValue('25');
  expect(head.getByRole('option', { name: 'No.0001 フシギダネ' })).toBeEnabled();
  expect(head.getByRole('option', { name: 'No.0649 ゲノセクト' })).toBeEnabled();
  expect(screen.getByRole('combobox', { name: '体を選択' })).toHaveValue('4');
});

test('番号で体を選び、同種同士は元の名前を使う', async () => {
  render(<App parts={parts} />);
  fireEvent.change(screen.getByRole('searchbox', { name: '体を検索' }), { target: { value: '０００１' } });
  fireEvent.change(screen.getByRole('combobox', { name: '体を選択' }), { target: { value: '1' } });
  expect(await screen.findByRole('img', { name: 'フシギダネ' })).toBeInTheDocument();
});

test('交換を2回行うと元に戻り、検索語はその欄に残る', async () => {
  render(<App parts={parts} />);
  const search = screen.getByRole('searchbox', { name: '頭を検索' });
  fireEvent.change(search, { target: { value: '1' } });
  fireEvent.click(screen.getByRole('button', { name: '頭と体を交換' }));
  expect(await screen.findByRole('img', { name: 'ヒトダネ' })).toBeInTheDocument();
  expect(search).toHaveValue('1');
  expect(screen.getByRole('combobox', { name: '頭を選択' })).toHaveValue('4');
  expect(within(screen.getByRole('region', { name: '頭' })).getByRole('option', { name: 'No.0004 ヒトカゲ' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: '頭と体を交換' }));
  expect(await screen.findByRole('img', { name: 'フシギカゲ' })).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: '頭を選択' })).toHaveValue('1');
  expect(within(screen.getByRole('region', { name: '頭' })).getByRole('option', { name: 'No.0001 フシギダネ' })).toBeEnabled();
});

test('ランダムは検索結果に関係なく片側・両側を選ぶ', async () => {
  const random = vi.spyOn(Math, 'random');
  render(<App parts={parts} />);
  fireEvent.change(screen.getByRole('searchbox', { name: '頭を検索' }), { target: { value: 'ミュウ' } });
  random.mockReturnValue(0.999999);
  fireEvent.click(screen.getByRole('button', { name: '頭をランダム' }));
  expect(await screen.findByRole('img', { name: 'ゲノカゲ' })).toBeInTheDocument();
  random.mockReturnValue(0);
  fireEvent.click(screen.getByRole('button', { name: '体をランダム' }));
  expect(await screen.findByRole('img', { name: 'ゲノダネ' })).toBeInTheDocument();
  random.mockReturnValueOnce(0).mockReturnValueOnce(0.999999);
  fireEvent.click(screen.getByRole('button', { name: '両方をランダム' }));
  expect(await screen.findByRole('img', { name: 'フシギセクト' })).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: '頭を選択' })).toHaveValue('1');
  expect(screen.getByRole('combobox', { name: '体を選択' })).toHaveValue('649');
});

test('第5世代の末尾649番を検索し、頭と体の両方に使える', async () => {
  render(<App parts={parts} />);
  fireEvent.change(screen.getByRole('searchbox', { name: '体を検索' }), { target: { value: '６４９' } });
  fireEvent.change(screen.getByRole('combobox', { name: '体を選択' }), { target: { value: '649' } });
  expect(await screen.findByRole('img', { name: 'フシギセクト' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '頭と体を交換' }));
  expect(await screen.findByRole('img', { name: 'ゲノダネ' })).toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox', { name: '体を検索' }), { target: { value: 'ゲノセクト' } });
  fireEvent.change(screen.getByRole('combobox', { name: '体を選択' }), { target: { value: '649' } });
  expect(await screen.findByRole('img', { name: 'ゲノセクト' })).toBeInTheDocument();
});
