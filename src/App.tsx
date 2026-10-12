import FusionPreview from './components/FusionPreview';
import parts from './data/fusion-parts.json';

export default function App() {
  return (
    <main className="app">
      <header>
        <p className="eyebrow">POKÉMON FUSION NEO</p>
        <h1>ポケモンフュージョン Neo</h1>
        <p className="intro">好きな2匹から、新しい組み合わせを。</p>
      </header>

      <section className="preparation" role="status">
        <h2>試作：6種類</h2>
        <p>頭と体を組み合わせた36通りの画像を確認できます。配色は調整前です。</p>
        <p>1025種類への対応は準備中です。</p>
      </section>

      <section aria-labelledby="materials-title">
        <h2 id="materials-title">試作素材</h2>
        <p>元画像から、頭と体を切り分けています。</p>
        <div className="material-grid">
          {parts.map(pokemon => <figure className="material-card" key={pokemon.id}>
            <figcaption>{pokemon.name}</figcaption>
            <div className="material-images">
              <div><img src={pokemon.originalPath} alt={`${pokemon.name}の元画像`} /><small>元画像</small></div>
              <div><img src={pokemon.head.path} alt={`${pokemon.name}の頭`} /><small>頭</small></div>
              <div><img src={pokemon.body.path} alt={`${pokemon.name}の体`} /><small>体</small></div>
            </div>
          </figure>)}
        </div>
      </section>

      <section aria-labelledby="gallery-title">
        <h2 id="gallery-title">36通りの合成結果</h2>
        <p>左のポケモンが頭、右のポケモンが体です。同じポケモン同士は元画像を表示します。</p>
        <div className="fusion-grid">
          {parts.flatMap(head => parts.map(body => <FusionPreview key={`${head.id}-${body.id}`} head={head} body={body} />))}
        </div>
      </section>

      <footer>
        <a href="https://pknavi.com/pokemonfusiongenerator">
          参考にしたポケモンフュージョンジェネレーター
        </a>
      </footer>
    </main>
  );
}
