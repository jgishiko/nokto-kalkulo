# NoktoKalkulo

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/jgishiko/nokto-kalkulo)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

小説原稿用の文字数カウントVS Code拡張機能

Markdown形式の小説原稿用文字数カウンターです。

## ✨ 機能

- 📝 **自動文字数カウント** - Markdown原稿を開くと自動でカウント
- 📊 **リアルタイム表示** - ステータスバーに現在の文字数を表示
- 📁 **ディレクトリ合計表示** - 同じディレクトリ配下（サブディレクトリ含む）の全ファイルの合計文字数を表示
- 🎯 **目標達成度表示** - 目標文字数との比較をパーセンテージで表示
- 💬 **セリフと地の文の分離** - かぎ括弧（「」『』）内のセリフと地の文を自動判別してカウント
- 📈 **詳細情報表示** - ステータスバーをクリックすると、セリフと地の文の文字数と割合（百分率）を出力パネルに表示
- 🎨 **ステータスバー背景色** - 最小文字数・目標文字数に基づいて背景色を変更し、進捗を視覚的に把握（オプション）
- ✍️ **柔軟なカウント規則**
  - 文字要素のみカウント：
    - ひらがな（\u3040-\u309F）
    - カタカナ（\u30A0-\u30FF）
    - 漢字（\u4E00-\u9FFF）
    - アルファベット（全角・半角）
    - 数字（全角・半角）
  - 記号、句読点、空白は除外
  - Markdownの見出し、リスト記号、コードブロック、HTMLコメント等は除外
  - 全角半角を問わず1文字としてカウント

## 🚀 使い方

### 基本的な使い方

1. Markdownファイル（`.md` ファイル）を開く
2. ステータスバー左側に文字数が自動表示されます

#### 表示形式

**目標文字数を設定している場合（複数ファイル）**：
```text
�️ 1,234字 | 3,456字 / 5,000字 (69%)
```

- 🖊️ = ペンシルアイコン（VS Codeのステータスバーアイコン）
- `1,234字` = 現在開いているファイルの文字数
- `3,456字` = 同じディレクトリ配下（サブディレクトリを含む）の全ファイルの合計文字数
- `5,000字` = 目標文字数
- `69%` = 目標達成率（合計文字数 ÷ 目標文字数）

**目標文字数を設定している場合（単一ファイル）**：
```text
🖊️ 1,234字 / 5,000字 (25%)
```

**目標文字数を設定していない場合（複数ファイル）**：
```text
🖊️ 1,234字 | 3,456字
```

**目標文字数を設定していない場合（単一ファイル）**：
```text
🖊️ 1,234字
```

> **注意**: 最小文字数（`minWords`）を設定している場合、ステータスバーには表示されませんが、背景色の制御に使用されます。

### 詳細情報の表示

ステータスバーの文字数表示をクリックすると、**出力パネル（OUTPUT）** に詳細な文字数情報が表示されます：

```text
📊 文字数詳細情報

【現在のファイル】
総文字数: 1,234字
├ セリフ: 456字 (37.0%)
└ 地の文: 778字 (63.0%)

【ディレクトリ全体】
総文字数: 5,678字
├ セリフ: 2,000字 (35.2%)
└ 地の文: 3,678字 (64.8%)
```

- **セリフ**: かぎ括弧「」と二重かぎ括弧『』で囲まれた部分の文字数
- **地の文**: セリフ以外の本文の文字数
- **百分率**: 総文字数に対する割合

複数ファイルがある場合は、現在のファイルとディレクトリ全体の両方の情報が表示されます。

### コマンド実行

`Ctrl+Shift+P` でコマンドパレットを開き、以下のコマンドを実行できます：

- `NoktoKalkulo: Count Manuscript Words` - 文字数を手動でカウント
- `NoktoKalkulo: Show Detailed Word Count` - 詳細な文字数情報を表示（ステータスバークリックと同じ）

## ⚙️ 設定

### 全作品共通の設定

VS Code の設定（`settings.json`）でカスタマイズできます：

```json
{
  // 文字数カウント機能の有効化
  "nokto.wordCount.enabled": true,
  
  // 最小文字数（デフォルト: 0、背景色制御にのみ使用）
  "nokto.wordCount.minWords": 0,
  
  // 目標文字数（デフォルト: 5000）
  "nokto.wordCount.targetWords": 5000,
  
  // ステータスバー表示の有効化
  "nokto.wordCount.showInStatusBar": true,
  
  // ステータスバー背景色表示の有効化（デフォルト: false）
  "nokto.wordCount.showBackgroundColor": false
}
```

### 作品ごとの設定

原稿ファイルがあるディレクトリに `.nokto.json` ファイルを配置することで、その作品専用の設定を指定できます。

**例1**: 目標文字数のみ変更
```json
{
  "targetWords": 8000
}
```

**例2**: 最小文字数と目標文字数を設定（進捗管理）
```json
{
  "minWords": 3000,
  "targetWords": 12000
}
```

**例3**: 背景色表示を有効化（視覚的フィードバック）
```json
{
  "minWords": 3000,
  "targetWords": 10000,
  "showBackgroundColor": true
}
```

**例4**: 機能の有効/無効も制御
```json
{
  "enabled": false
}
```

**使用例**:
- 全作品共通設定で`enabled: false`にしておき、特定の作品だけ`.nokto.json`で`enabled: true`にする
- 作品ごとに異なる目標文字数を設定する
- 特定の作品だけ最小文字数を設定し、背景色で進捗を管理する
- 締め切りが近い作品だけ背景色表示を有効にする

設定ファイルがある場合はその設定が優先され、ない場合は全作品共通の設定が使用されます。

#### 設定可能な項目

| 項目 | 型 | 説明 |
|------|-----|------|
| `enabled` | boolean | その作品でのカウント機能の有効/無効 |
| `minWords` | number | その作品の最小文字数（背景色制御用） |
| `targetWords` | number | その作品の目標文字数 |
| `showBackgroundColor` | boolean | ステータスバーの背景色表示の有効/無効 |

### 設定項目の詳細

| 設定項目 | 型 | デフォルト | 説明 |
|---------|-----|-----------|------|
| `nokto.wordCount.enabled` | boolean | `true` | 文字数カウント機能の有効/無効 |
| `nokto.wordCount.minWords` | number | `0` | 最小文字数（背景色制御用、ステータスバーには表示されない） |
| `nokto.wordCount.targetWords` | number | `5000` | 目標文字数 |
| `nokto.wordCount.showInStatusBar` | boolean | `true` | ステータスバー表示の有効/無効 |
| `nokto.wordCount.showBackgroundColor` | boolean | `false` | ステータスバー背景色表示の有効/無効 |

#### 背景色表示について

`showBackgroundColor` を `true` に設定すると、文字数の状況に応じてステータスバーの背景色が変わります：

- **赤色**：合計文字数が最小文字数以下の場合（`minWords` 設定時）
- **黄色**：合計文字数が目標文字数以上の場合（`targetWords` 設定時）
- **デフォルト**：上記以外の場合（最小文字数と目標文字数の間）

> **注意**: 最小文字数（`minWords`）はステータスバーには表示されず、背景色の制御にのみ使用されます。進捗状況を視覚的に把握したい場合に設定してください。

## 📦 インストール

### VS Code マーケットプレイスから（公開予定）

1. VS Code の拡張機能ビューを開く（`Ctrl+Shift+X`）
2. "NoktoKalkulo" を検索
3. "インストール" をクリック

### 手動インストール

```bash
# リポジトリをクローン
git clone https://github.com/jgishiko/nokto-kalkulo.git
cd nokto-kalkulo

# 依存関係をインストール
npm install

# パッケージをビルド
npm run package

# VSIXファイルをインストール
code --install-extension nokto-kalkulo-*.vsix
```

## 🔧 開発

### 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# コンパイル
npm run compile

# 監視モード（自動再コンパイル）
npm run watch
```

### デバッグ実行

1. VS Code でこのフォルダを開く
2. `F5` キーを押して拡張機能開発ホストを起動
3. 新しいウィンドウでMarkdownファイルを開いてテスト

### テスト実行

```bash
npm run test
```

## 🤝 コントリビューション

バグ報告や機能提案は [Issues](https://github.com/jgishiko/nokto-kalkulo/issues) へお願いします。

プルリクエストも歓迎します！

## 📝 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🔗 関連リンク

- [開発ガイド](docs/development-guide.md)
- [設計ドキュメント](docs/design.md)
- [テストケース](test/test-cases.md)

---

**NoktoKalkulo** - 小説執筆をもっと快適に 📚✨
