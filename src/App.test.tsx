import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from './App';

test('アプリ名と、まだ合体できない準備状況を伝える', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { level: 1, name: 'ポケモンフュージョン Neo' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('準備中');
  expect(screen.getByRole('status')).toHaveTextContent('合体機能はまだ利用できません');
});
