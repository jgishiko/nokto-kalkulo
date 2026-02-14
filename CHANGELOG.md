# Change Log

All notable changes to the "NoktoKalkulo" extension will be documented in this file.

## [Unreleased]

### Added

- ✨ **セリフと地の文の分離カウント機能**（2026-02-14）
  - かぎ括弧「」と二重かぎ括弧『』で囲まれたセリフを自動判別
  - セリフと地の文を分離して文字数をカウント
  - ステータスバークリックで詳細情報を出力パネルに表示
  - ファイル切り替え時に詳細情報を自動更新
  - 詳細情報には以下を含む：
    - 現在のファイルとディレクトリ全体の総文字数
    - セリフの文字数と全体に占める割合（百分率）
    - 地の文の文字数と全体に占める割合（百分率）
    - 目標文字数、進捗率、残り文字数（目標文字数設定時のみ）
  - 新しいコマンド追加：`NoktoKalkulo: Show Detailed Word Count`

### Changed

- ✨ **ステータスバー表示形式の改善**（2026-02-14）
  - アイコンを削除しシンプルな表示に変更
  - 新しい表示形式：`1,234字` または `1,234字 | 75%`（目標文字数設定時）
  - ステータスバークリックで詳細情報を表示するように変更

- ✨ **設定項目のシンプル化**（2026-02-14）
  - `nokto.wordCount.enabled` を削除（常に有効）
  - `nokto.wordCount.minWords` を削除（不要な複雑さを削減）
  - `nokto.wordCount.showBackgroundColor` を削除（装飾要素を削減）
  - `nokto.wordCount.targetWords` のデフォルトを5000から0に変更（0の場合は進捗率非表示）
  - 残った設定：`targetWords`、`showInStatusBar` のみ

### Planned

- プロットファイルから目標文字数を自動抽出
- リアルタイム文字数グラフ
- 執筆速度の計測
- セクションごとの文字数内訳
- カスタマイズ可能なカウント規則
  - 会話文（「」内）を1文字としてカウントするオプション
  - 三点リーダー（…）を2文字としてカウントするオプション

## [0.1.0] - 2026-02-14

### Added

- ✅ **基本機能**
  - Markdown原稿ファイルの文字数カウント機能
  - ステータスバーへのリアルタイム表示
  - 目標文字数との比較表示（パーセンテージ）

- ✅ **カウント機能**
  - 文字要素のみをカウント（ひらがな、カタカナ、漢字、アルファベット、数字）
  - 記号、句読点、空白を除外
  - 全角・半角を問わず1文字としてカウント
  - Markdown要素の自動除外
    - 見出し行全体（`#` で始まる行）
    - リスト記号（`-`, `*`, `+`, `1.`）
    - コードブロック（` ``` `）
    - インラインコード（`` ` ``）
    - 引用行（`>` で始まる行）
    - HTMLコメント（`<!-- -->`）
    - HTMLタグ（`<tag>`）
    - 強調記号（`**`, `*`, `_`）

- ✅ **ディレクトリ合計機能**
  - 現在のファイルの文字数を表示
  - 同じディレクトリ配下（サブディレクトリ含む）の全 `.md` ファイルの合計文字数を表示

- ✅ **設定項目**
  - `nokto.wordCount.targetWords` - 目標文字数（デフォルト: 0）
  - `nokto.wordCount.showInStatusBar` - ステータスバー表示の切替

- ✅ **ディレクトリ固有設定**
  - `.nokto.json` 設定ファイルのサポート
  - 作品ごとに異なる設定を指定可能
  - VS Code設定よりも優先される

- ✅ **コマンド**
  - `NoktoKalkulo: Count Manuscript Words` - 手動カウント実行
  - `nokto.debugCount`（開発者向け） - デバッグ情報をコンソールに出力

### Technical

- TypeScript + ESBuild による実装
- ManuscriptParser による原稿解析
  - 正規表現ベースの文字要素抽出
  - Unicode範囲指定による正確なカウント
- StatusBarManager によるUI管理
  - 動的な背景色制御
  - 柔軟な表示フォーマット
- WordCountController によるイベント処理
  - エディタ切り替え時の自動更新
  - ドキュメント変更時の自動更新
  - 設定変更時の自動更新
  - ディレクトリ配下のファイル検索・集計

---

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

