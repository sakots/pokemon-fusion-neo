# pokemon-fusion-neo

[ポケナビのポケモンフュージョンジェネレーター](https://pknavi.com/pokemonfusiongenerator)を参考に、全国図鑑No.0001〜1025のポケモンを合体できる生成機を開発するプロジェクトです。

React・TypeScript・Viteによる開発基盤と、準備状況を表示する初期画面を実装しました。ポケモンのデータ準備と画像合成は未実装です。

実装にはReact・TypeScriptを使い、パッケージ管理にはpnpmを使います。

## 資料

- [元サイトの調査と1025種類への実装方針](docs/fusion-research.md)
- [実装仕様と開発手順](docs/implementation-plan.md)
- [開発環境と起動・確認手順](docs/development.md)

## 更新履歴

### [2026/10/13] v0.1.0

- 元サイトの画像表示方式と確認できていない制作工程を資料に整理した。
- 1025種類に対応するための画像合成方式と段階的な開発方針を資料に追加した。
- 調査結果と実装方針をdocs内に分離し、READMEに資料へのリンクを追加した。
- React・TypeScript・pnpmを前提とした実装仕様、データ準備、テストとリリースの確認手順を資料に追加した。
- React・TypeScript・Viteの開発基盤と準備状況を表示する初期画面を追加した。
- pnpmで画面テスト、型検査、ビルドを実行できるようにした。
