export default function App() {
  return (
    <main className="app">
      <header>
        <p className="eyebrow">POKÉMON FUSION NEO</p>
        <h1>ポケモンフュージョン Neo</h1>
        <p className="intro">好きな2匹から、新しい組み合わせを。</p>
      </header>

      <section className="preparation" role="status">
        <h2>準備中</h2>
        <p>
          全国図鑑No.0001〜1025のポケモンを組み合わせられるよう、
          データと画像を準備しています。
        </p>
        <p>合体機能はまだ利用できません。</p>
      </section>

      <footer>
        <a href="https://pknavi.com/pokemonfusiongenerator">
          参考にしたポケモンフュージョンジェネレーター
        </a>
      </footer>
    </main>
  );
}
