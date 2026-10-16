# OpenSpecの運用

## 資料の役割

現行仕様の正本は`openspec/specs/<capability>/spec.md`です。`docs/`には開発・データ整備の手順、設計の補足、調査と検証記録を置きます。入口は[資料一覧](README.md)です。

- `openspec/config.yaml`：成果物の言語、変更範囲、仕様・実装・検証の進め方を指定します。技術構成や実装の詳細は重複して記載しません。
- `openspec/specs/`：現在提供する機能の要求とシナリオを管理します。
- `openspec/changes/<change-name>/`：提案中・実装中の変更を管理します。ここにある差分仕様を、実装前に現行仕様として扱いません。
- `openspec/changes/archive/`：完了した変更と、その判断・作業内容を保存します。
- `docs/`：起動、素材編集、リリース確認の手順と、過去の確認結果を管理します。過去のテスト件数や対応数は当時の記録です。
- `README.md`・`changelog.md`：利用者向けの概要と更新履歴を記載します。更新履歴は両方に同じ内容を追記します。

導入時のベースラインは、既存実装と資料から整理した[データ](../openspec/specs/pokemon-data/spec.md)、[合成](../openspec/specs/fusion-generation/spec.md)、[選択画面](../openspec/specs/pokemon-selection/spec.md)、[部位編集](../openspec/specs/mask-editor/spec.md)です。新機能の追加ではありません。世代別の検証記録や試作時の画像は、根拠として元の場所に残します。

## 変更の流れ

仕様や振る舞いを変える場合は、標準の`spec-driven`スキーマを使います。1つの変更で扱う機能・修正は1つに絞ります。誤字・リンクの修正や、振る舞いを変えない設定・資料の整理だけなら、不要な変更提案は作りません。

1. 関連する現行仕様、`docs/`、実装を確認します。提案・仕様・必要な設計を先に更新し、実装との違いを明示します。
2. 変更名を英小文字のkebab-caseで決め、CLIで作成します。

   ```bash
   openspec new change <change-name>
   openspec status --change <change-name> --json
   openspec instructions proposal --change <change-name> --json
   ```

3. CLIの指示と依存順に従い、`proposal.md`、`specs/<capability>/spec.md`、必要な`design.md`、`tasks.md`を作ります。各成果物の指示は`openspec instructions <artifact-id> --change <change-name> --json`で確認します。差分仕様は`ADDED`・`MODIFIED`・`REMOVED`などの変更区分で記載し、既存機能は同じcapabilityへまとめます。
4. 提案を確認してから実装します。動作変更は期待する振る舞いのテストを先に書き、失敗を確認して最小実装します。テストだけでなく、変更した画面・コマンドを実際に動かして確認します。資料だけの変更では不要なアプリテストを追加しません。
5. 関連する手順・更新履歴を更新し、実施した検証と未確認事項を記録します。完了したタスクだけをチェックします。リリース時は[リリース前の確認](implementation-plan.md#リリース前の確認)に従います。
6. 実装・検証が完了した変更をアーカイブし、差分仕様を現行仕様へ反映します。

   ```bash
   openspec validate <change-name> --strict --no-interactive
   openspec archive <change-name>
   openspec validate --all --strict --no-interactive
   ```

アーカイブ時の検証や仕様反映を省略して、未実装の要求を現行仕様にしないでください。

## 状態と整合性の確認

```bash
openspec --version
openspec list --json
openspec list --specs --json
openspec validate --all --strict --no-interactive
openspec doctor
```

`openspec list`は進行中の変更、`openspec list --specs`は現行仕様を表示します。変更が0件でも、仕様が未整備とは限りません。`validate`は仕様・提案の形式、`doctor`はOpenSpecルートと参照関係を確認します。アプリの動作やMarkdownリンクの正しさまで保証するものではありません。

## CLIと生成済みスキル

OpenSpec CLIは開発者用ツールで、アプリの実行時依存ではありません。この運用手順はCLI 1.14.2で確認しています。CLI未導入の環境では、[公式リポジトリ](https://github.com/Fission-AI/OpenSpec)の導入手順を確認してください。

`.agents/skills/openspec-*`はOpenSpecが生成したワークフローです。プロジェクト固有の規則は生成済みスキルに直接書かず、`openspec/config.yaml`とこの資料で管理します。CLI更新に伴う`openspec update`の実行時は、生成済みファイルの差分を確認し、手編集した内容を不用意に上書きしないでください。
