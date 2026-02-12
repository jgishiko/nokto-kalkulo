# Change Log

All notable changes to the "NoktoKalkulo" extension will be documented in this file.

## [Unreleased]

### Planned

- プロットファイルから目標文字数を自動抽出
- 複数の原稿ファイルの合計文字数表示
- カスタマイズ可能なカウント規則

## [0.1.0] - 2026-02-11

### Added

- Markdown原稿ファイルの文字数カウント機能
- ステータスバーへのリアルタイム表示
- 目標文字数との比較表示
- 柔軟な文字数カウント規則
  - 会話文（「」内）を1文字としてカウント
  - 三点リーダー（…）を2文字としてカウント
  - ダッシュ（―）を1文字としてカウント
  - 改行・空白を除外
- 設定項目の追加
  - `nokto.wordCount.enabled` - 機能の有効/無効
  - `nokto.wordCount.targetWords` - 目標文字数
  - `nokto.wordCount.showInStatusBar` - ステータスバー表示の切替
- コマンド `NoktoKalkulo: Count Manuscript Words` を追加
- デバッグコマンド `nokto.debugCount` を追加（開発者向け）

### Technical

- TypeScript + ESBuild による実装
- ManuscriptParser による原稿解析
- StatusBarManager によるUI管理
- WordCountController によるイベント処理

---

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
