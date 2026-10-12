# 開発環境

## 前提と現在の段階

Node.js 26以上とpnpm 12.11.2を使います。package.jsonのpackageManagerとpnpm-lock.yamlで、使用するpnpmと依存パッケージを記録します。

開発基盤にはReact・TypeScript・Viteによる起動、VitestとReact Testing Libraryによる画面テスト、TypeScriptの型検査、静的ビルドを用意しています。1025種類の元データと元画像も準備済みです。初期画面は準備状況を表示するもので、選択画面と画像合成は今後追加します。

以下のコマンドを実行できます。

## 起動

```bash
pnpm install --frozen-lockfile
pnpm dev
```

開発サーバーが出力したURLを開きます。

## 自動確認

```bash
pnpm test
pnpm typecheck
pnpm validate:data
pnpm build
git diff --check
```

`pnpm test`は監視せずに終了します。開発中にテストを監視する場合は`pnpm test:watch`を使います。型検査はアプリケーション、データ準備スクリプト、テスト、Viteの設定を対象とします。ビルドは型検査の後に行い、distへ出力します。

`pnpm validate:data`は、保存済みの一覧と1025枚の元画像をネットワークなしで検証します。再取得には`pnpm import:data`を使います。取得元とキャッシュの詳細は[データ準備](data-preparation.md)を参照してください。

## ブラウザでの確認

```bash
pnpm preview
```

ビルド済みの画面を確認します。開発基盤では、幅360pxと1280pxで見出しと準備状況が表示され、横方向にはみ出さないことを確認します。表示色は背景に対して読み取れるものを使い、日本語のページとして表示します。

全機能のテーマ診断とリリース条件は[実装仕様](implementation-plan.md#リリース前の確認)に従います。

## 開発基盤の確認結果

Node.js v26.11.1、pnpm v12.11.2で確認しました。

| 確認項目 | 結果 |
| --- | --- |
| TDD | 未実装の画面で見出しのテストが失敗することを確認し、実装後に1件のテストが成功した |
| 型検査・ビルド | pnpm build内の型検査とViteのビルドが成功した |
| ロックファイル | pnpm install --frozen-lockfileが成功した |
| Edgeでの表示 | 幅360pxと1280pxで見出しと準備状況が表示され、日本語設定と横方向のはみ出しがないことを確認した |
| 配色・フォーカス | 表示文字のコントラスト比は最小約6.1対1。Tabキーで参考サイトへのリンクのフォーカス表示を確認した |
| ブラウザの実行エラー | Edgeで初期画面を表示した際のJavaScript例外はなかった |
| Firefox | 環境側のプロファイル制約で起動できず未確認。リリース前に確認する |

合体機能のテストとテーマ診断は、機能を追加してから実施します。
