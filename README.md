# NoktoKalkulo

Markdown形式の小説原稿向け文字数カウント拡張機能です。

記号やMarkdown記法を除外し、本文の文字のみをカウントします。
執筆量を正確に把握することを目的としています。

---

## 機能

- Markdownファイルを自動で文字数カウント
- ステータスバーに現在の文字数を表示
- ディレクトリ単位での合計文字数計算（サブディレクトリ含む）
- 目標文字数に対する進捗表示
- セリフ（「」『』）と地の文の分離カウント
- 詳細情報を出力パネルに表示

---

## カウント規則

以下の文字をカウント対象とします：

- ひらがな
- カタカナ
- 漢字
- アルファベット（全角・半角）
- 数字（全角・半角）

以下はカウント対象外です：

- 句読点
- 記号
- 空白
- Markdown構文（見出し、リスト記号など）
- コードブロック
- HTMLコメント

全角・半角はともに1文字として扱います。

---

## 表示仕様

### ステータスバー

目標文字数を設定している場合：

    1,234字 | 69%

目標文字数を設定していない場合：

    1,234字

ステータスバーをクリックすると出力パネルに詳細情報を表示します。

---

### 出力パネル

    NoktoKalkulo

    === 現在のファイル ===

    総文字数: 1,234字

    セリフ: 456字 (37%)
    地の文: 778字 (63%)

    ----------------------------------------

    === ディレクトリ合計 ===

    総文字数: 5,678字 / 8,000字

    進捗: 71%
    残り: 2,322字

    セリフ: 2,000字 (35%)
    地の文: 3,678字 (65%)

- セリフ：かぎ括弧「」および『』内の文字数
- 地の文：セリフ以外の本文文字数
- 進捗・残り：目標文字数を設定している場合のみ表示

---

## 設定

### VS Code 設定（settings.json）

    {
      "nokto.wordCount.targetWords": 8000,
      "nokto.wordCount.showInStatusBar": true
    }

| 設定項目 | 型 | デフォルト | 説明 |
| -------- | -- | ---------- | ---- |
| nokto.wordCount.targetWords | number | 0 | 目標文字数（0の場合は進捗非表示） |
| nokto.wordCount.showInStatusBar | boolean | true | ステータスバー表示の有効/無効 |

---

### 作品ごとの設定

原稿ディレクトリに `.nokto.json` を配置することで、
その作品専用の目標文字数を設定できます。

例：

    {
      "targetWords": 12000
    }

設定ファイルが存在する場合はそちらが優先されます。

---

## コマンド

- NoktoKalkulo: Count Manuscript Words
- NoktoKalkulo: Show Detailed Word Count

---

## ライセンス

MIT License

---

## English

NoktoKalkulo is a word count extension for fiction written in Markdown.

It counts only textual characters in the manuscript body,
excluding symbols and Markdown syntax, in order to measure actual writing volume.

### Features

- Automatic word counting for Markdown files
- Current file count displayed in the status bar
- Directory-wide total word count (including subdirectories)
- Progress display against a target word count
- Separate counting of dialogue ("「」" and "『』") and narrative text
- Detailed breakdown shown in the Output panel

### Counting Rules

The following characters are counted:

- Hiragana
- Katakana
- Kanji
- Alphabet characters (full-width and half-width)
- Numbers (full-width and half-width)

The following are excluded:

- Punctuation
- Symbols
- Whitespace
- Markdown syntax (headings, list markers, etc.)
- Code blocks
- HTML comments

Full-width and half-width characters are both counted as one character.

### Configuration

Global settings (VS Code `settings.json`):

    {
      "nokto.wordCount.targetWords": 8000,
      "nokto.wordCount.showInStatusBar": true
    }

Per-project configuration via `.nokto.json`:

    {
      "targetWords": 12000
    }
