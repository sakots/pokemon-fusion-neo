# 資料一覧

## 現在の状態

全国図鑑No.0001〜1025の基本形について、元画像・頭と体の部位・接続情報・配色を用意し、ブラウザのCanvasで合成します。検索、ランダム選択、左右交換、体の皮膚色を頭に合わせる切り替えに対応しています。全種を選択できることと、全1,050,625通りの形・配色の品質が完成していることは区別します。品質調整とFirefoxでの確認は引き続き必要です。

## 現行仕様（OpenSpec）

要求とシナリオの正本です。仕様を変える場合は[OpenSpecの運用](openspec.md)に従います。

| 仕様 | 対象 |
| --- | --- |
| [ポケモンデータ](../openspec/specs/pokemon-data/spec.md) | 対象種、基本形、日本語名、元画像、部位素材の準備と検証 |
| [合体生成](../openspec/specs/fusion-generation/spec.md) | 合体名、同種表示、頭と体の接続、Canvas描画、配色変換 |
| [ポケモンの選択](../openspec/specs/pokemon-selection/spec.md) | 検索、選択、ランダム、交換、読み込み・失敗時の表示 |
| [部位定義の編集](../openspec/specs/mask-editor/spec.md) | 開発用の編集画面、JSON保存・取込、入力の検証 |

## 開発・整備の手順と設計補足

仕様本文を重複管理せず、操作・構成・確認の方法を説明します。各資料内の過去の確認結果は、その変更を実施した時点の記録です。

| 資料 | 用途 |
| --- | --- |
| [開発環境](development.md) | 必要なツール、起動、自動確認、ビルドと配信 |
| [OpenSpecの運用](openspec.md) | 仕様・提案・手順の役割、変更からアーカイブまでの流れ |
| [構成と開発・リリース方針](implementation-plan.md) | 技術構成、ファイルの役割、TDD、リリース条件 |
| [データ準備](data-preparation.md) | データ・元画像の取得元、取込と検証、出典と権利上の注意 |
| [部位定義の編集ツール](mask-editor.md) | 作図、接続・補完・保護・配色の編集、JSON取込と素材生成 |
| [操作画面の補足と検証記録](selection-ui.md) | 選択画面の操作説明と、変更時の実ブラウザ確認 |
| [配色変換の補足と比較画像](color-matching.md) | 変換対象・保護領域の定義、色の対応と品質上の制約 |

## 調査・試作・世代別の検証記録

当時の方針・対応数・テスト件数・未完了事項を残した資料です。過去の「準備中」「残る種類数」を現在の未対応数として扱いません。仕様変更の作業一覧は`openspec/changes/`で管理し、完了後は`archive/`に保存します。

- [元サイトの調査と方式比較](fusion-research.md)
- [最初の6種類・36通りの合成試作](fusion-prototype.md)
- [第1世代151種類](generation-one.md)
- [第2世代100種類の追加](generation-two.md)
- [第3世代135種類の追加](generation-three.md)
- [第4世代107種類の追加](generation-four.md)
- [第5世代156種類の追加](generation-five.md)
- [第6世代72種類の追加](generation-six.md)
- [第7世代88種類の追加](generation-seven.md)
- [第8世代96種類の追加](generation-eight.md)
- [第9世代120種類の追加と全1025種類の確認](generation-nine.md)

更新履歴は[README](../README.md#更新履歴)と[changelog](../changelog.md)に記載します。
