import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import partsUrl from './data/fusion-parts.json?url';
import type { FusionPokemon } from './domain/fusion';
import './styles.css';

const root = createRoot(document.getElementById('root')!);
root.render(<main className="app"><p role="status">ポケモンデータを読み込み中</p></main>);

fetch(partsUrl).then(async response => {
  if (!response.ok) throw new Error(`ポケモンデータを読み込めません: ${response.status}`);
  const parts: FusionPokemon[] = await response.json();
  root.render(
    <StrictMode>
      <App parts={parts} />
    </StrictMode>,
  );
}).catch(() => {
  root.render(<main className="app"><p role="alert">ポケモンデータを読み込めませんでした。ページを再読み込みしてください。</p></main>);
});
