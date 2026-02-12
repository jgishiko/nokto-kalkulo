# NoktoKalkulo

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/jgishiko/nokto-kalkulo)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

小説原稿用の文字数カウントVS Code拡張機能

Markdown形式の小説原稿用文字数カウンターです。

## ✨ 機能

- 📝 **自動文字数カウント** - Markdown原稿を開くと自動でカウント
- 📊 **リアルタイム表示** - ステータスバーに現在の文字数を表示
- 🎯 **目標達成度表示** - 目標文字数との比較をパーセンテージで表示
- � **柔軟なカウント規則**
  - 会話文（「」内）は1文字としてカウント
  - 三点リーダー（…）は2文字としてカウント
  - ダッシュ（―）は1文字としてカウント
  - 改行・空白は除外

## 🚀 使い方

### 基本的な使い方

1. Markdownファイル（`.md` ファイル）を開く
2. ステータスバー左側に文字数が自動表示されます

```text
📝 1,234字 | 3,456字 / 5,000字 (69%)
```

- `1,234字` = 現在開いているファイルの文字数
- `3,456字` = 同じディレクトリ内の全ファイルの合計文字数
- `5,000字` = 目標文字数
- `69%` = 目標達成率

### コマンド実行

`Ctrl+Shift+P` でコマンドパレットを開き、以下のコマンドを実行できます：

- `NoktoKalkulo: Count Manuscript Words` - 文字数を手動でカウント

## ⚙️ 設定

### 全作品共通の設定

VS Code の設定（`settings.json`）でカスタマイズできます：

```json
{
  // 文字数カウント機能の有効化
  "nokto.wordCount.enabled": true,
  
  // 目標文字数（デフォルト: 5000）
  "nokto.wordCount.targetWords": 5000,
  
  // ステータスバー表示の有効化
  "nokto.wordCount.showInStatusBar": true
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

**例2**: 機能の有効/無効も制御
```json
{
  "enabled": true,
  "targetWords": 12000
}
```

**使用例**:
- 全作品共通設定で`enabled: false`にしておき、特定の作品だけ`.nokto.json`で`enabled: true`にする
- 作品ごとに異なる目標文字数を設定する

設定ファイルがある場合はその設定が優先され、ない場合は全作品共通の設定が使用されます。

#### 設定可能な項目

| 項目 | 型 | 説明 |
|------|-----|------|
| `enabled` | boolean | その作品でのカウント機能の有効/無効 |
| `targetWords` | number | その作品の目標文字数 |

### 設定項目の詳細

| 設定項目 | 型 | デフォルト | 説明 |
|---------|-----|-----------|------|
| `nokto.wordCount.enabled` | boolean | `true` | 文字数カウント機能の有効/無効 |
| `nokto.wordCount.targetWords` | number | `5000` | 目標文字数 |
| `nokto.wordCount.showInStatusBar` | boolean | `true` | ステータスバー表示の有効/無効 |

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
