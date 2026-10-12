import { useState } from 'react';
import FusionPreview from './components/FusionPreview';
import PokemonPicker from './components/PokemonPicker';
import parts from './data/fusion-parts.json';
import { randomPokemon } from './domain/selection';

export default function App() {
  const [headId, setHeadId] = useState(1);
  const [bodyId, setBodyId] = useState(4);
  const head = parts.find(entry => entry.id === headId)!;
  const body = parts.find(entry => entry.id === bodyId)!;

  function swap() {
    setHeadId(bodyId);
    setBodyId(headId);
  }

  function randomizeBoth() {
    setHeadId(randomPokemon(parts).id);
    setBodyId(randomPokemon(parts).id);
  }

  return (
    <main className="app">
      <header>
        <p className="eyebrow">POKÉMON FUSION NEO</p>
        <h1>ポケモンフュージョン Neo</h1>
        <p className="intro">好きな2匹から、新しい組み合わせを。</p>
      </header>

      <section className="preparation" aria-label="試作の状況">
        <h2>試作：{parts.length}種類</h2>
        <p>{parts.length}種類から頭と体を選んで合体できます。配色は調整前です。</p>
        <p>1025種類への対応は準備中です。</p>
      </section>

      <section className="result-panel" aria-labelledby="result-title">
        <h2 id="result-title">合体結果</h2>
        <FusionPreview head={head} body={body} />
        <div className="selection-actions">
          <button type="button" onClick={randomizeBoth}>両方をランダム</button>
          <button type="button" onClick={swap}>頭と体を交換</button>
        </div>
      </section>

      <div className="picker-grid">
        <PokemonPicker side="head" label="頭" pokemon={parts} selected={head} onSelect={setHeadId}
          onRandom={() => setHeadId(randomPokemon(parts).id)} />
        <PokemonPicker side="body" label="体" pokemon={parts} selected={body} onSelect={setBodyId}
          onRandom={() => setBodyId(randomPokemon(parts).id)} />
      </div>

      <footer>
        <a href="https://pknavi.com/pokemonfusiongenerator">
          参考にしたポケモンフュージョンジェネレーター
        </a>
      </footer>
    </main>
  );
}
