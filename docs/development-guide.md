# NoktoKalkulo - 開発ガイド

小説原稿用文字数カウントVS Code拡張機能の開発手順

---

## 開発環境セットアップ

### 必要なツール

```bash
# Node.js と npm（推奨: Node.js 18以上）
node --version
npm --version

# Yeoman と VS Code Extension Generator
npm install -g yo generator-code

# TypeScript（既にインストール済みの場合はスキップ）
npm install -g typescript
```

---

## プロジェクト作成

### 1. 拡張機能プロジェクトを作成

```bash
# プロジェクトディレクトリへ移動
cd c:\Users\yoshihisa\OneDrive\Documents\GitHub\nokto-kalkulo

# Yeomanで拡張機能プロジェクトを作成
yo code
```

### Yeomanの質問に回答

```text
? What type of extension do you want to create?
  → New Extension (TypeScript)

? What's the name of your extension?
  → NoktoKalkulo

? What's the identifier of your extension?
  → nokto-kalkulo

? What's the description of your extension?
  → 小説原稿の文字数カウント機能

? Initialize a git repository?
  → No（既存のリポジトリを使用）

? Which bundler to use?
  → esbuild

? Which package manager to use?
  → npm
```

---

## ファイル構成

プロジェクト作成後の実際の構成：

```text
nokto-kalkulo/
├── package.json                  # 拡張機能マニフェスト
├── tsconfig.json                 # TypeScript設定
├── esbuild.js                    # esbuildビルド設定
├── eslint.config.mjs             # ESLint設定
├── .vscodeignore                # パッケージング時の除外ファイル
├── README.md                     # プロジェクトREADME
├── CHANGELOG.md                  # 変更履歴
├── LICENSE                       # ライセンス
├── PUBLISHING.md                 # 公開ガイド
├── src/
│   ├── extension.ts             # エントリーポイント
│   ├── wordCountController.ts   # メインコントローラー
│   ├── manuscriptParser.ts      # 原稿パーサー
│   └── statusBarManager.ts      # ステータスバー管理
├── test/
│   ├── test-cases.md            # テストケース一覧
│   └── suite/
│       ├── index.ts             # テストスイート設定
│       └── parser.test.ts       # パーサーテスト
├── docs/
│   ├── design.md                # 設計ドキュメント
│   └── development-guide.md     # 開発ガイド（このファイル）
└── dist/
    └── extension.js             # コンパイル済みファイル
```

---

## package.json の設定

重要な設定項目：

```json
{
  "name": "nokto-kalkulo",
  "displayName": "NoktoKalkulo",
  "description": "小説原稿の文字数カウント",
  "version": "0.1.0",
  "publisher": "YOUR-PUBLISHER-ID",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": [
    "Other"
  ],
  "activationEvents": [
    "onLanguage:markdown"
  ],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "nokto.countWords",
        "title": "NoktoKalkulo: Count Manuscript Words"
      },
      {
        "command": "nokto.showDetailedCount",
        "title": "NoktoKalkulo: Show Detailed Word Count"
      }
    ],
    "configuration": {
      "title": "NoktoKalkulo",
      "properties": {
        "nokto.wordCount.targetWords": {
          "type": "number",
          "default": 0,
          "description": "目標文字数（0の場合は非表示）"
        },
        "nokto.wordCount.showInStatusBar": {
          "type": "boolean",
          "default": true,
          "description": "ステータスバーに表示"
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run package",
    "compile": "node ./esbuild.js",
    "watch": "node ./esbuild.js --watch",
    "package": "node ./esbuild.js --production",
    "compile-tests": "tsc -p . --outDir out",
    "watch-tests": "tsc -p . -w --outDir out",
    "pretest": "npm run compile-tests && npm run compile && npm run lint",
    "lint": "eslint src",
    "test": "vscode-test"
  }
}
```

### スクリプトの説明

- `compile` - esbuildでTypeScriptをコンパイル
- `watch` - ファイル変更を監視して自動コンパイル
- `package` - 本番用にバンドル（最小化）
- `lint` - ESLintでコードチェック
- `test` - テストを実行

---

## 開発手順

### Phase 1: パーサー実装（完了）

✅ `.vscode/manuscriptParser.ts` を `src/` へ作成
✅ ユニットテストを作成（`test/suite/parser.test.ts`）
✅ 文字要素のみをカウントするロジックを実装

```bash
# テスト実行
npm test
```

### Phase 2: コントローラー実装（完了）

✅ `src/wordCountController.ts` を作成
✅ ドキュメント変更の監視を実装
✅ パーサーと連携
✅ ディレクトリ合計文字数の計算機能を実装
✅ `.nokto.json` 設定ファイルの読み込み機能を実装

```typescript
// wordCountController.ts の主要機能
export class WordCountController {
  private parser: ManuscriptParser;
  private statusBar: StatusBarManager;
  private disposable: vscode.Disposable;
  private currentFileResult: WordCountResult | null = null;
  private directoryResult: WordCountResult | null = null;
  private outputChannel: vscode.OutputChannel;

  constructor() {
    this.parser = new ManuscriptParser();
    this.statusBar = new StatusBarManager();
    this.outputChannel = vscode.window.createOutputChannel('NoktoKalkulo');
    
    // イベントリスナーを登録
    vscode.window.onDidChangeActiveTextEditor(...);
    vscode.workspace.onDidChangeTextDocument(...);
    vscode.workspace.onDidChangeConfiguration(...);
    
    this.updateWordCount();
  }

  async updateWordCount(): Promise<void> {
    // 現在のファイルの文字数をカウント（詳細版）
    this.currentFileResult = this.parser.countWordsDetailed(content);
    // ディレクトリ合計を計算
    this.directoryResult = await this.countFilesInDirectoryDetailed(directoryUri);
    // ステータスバーに表示
  }

  private async countFilesInDirectoryDetailed(directoryUri: vscode.Uri): Promise<WordCountResult> {
    // ディレクトリ配下の全.mdファイルの詳細文字数を計算
    // セリフと地の文を分離して集計
  }

  showDetailedCount(): void {
    // OutputChannelに詳細情報を表示
    // セリフと地の文の文字数、割合を出力
    // ちらつき防止のため以下の最適化を実装：
    // 1. デバウンス処理（1秒）で連続更新を防止
    // 2. 差分更新で不要な再描画を回避
  }

  private async getConfiguration(fileUri?: vscode.Uri) {
    // VS Code設定と.nokto.json設定を統合
  }
}
```

### Phase 3: ステータスバー実装（完了）

✅ `src/statusBarManager.ts` を作成
✅ コントローラーと連携
✅ クリック時の詳細情報表示への連携

```typescript
// statusBarManager.ts の主要機能
export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;

  update(
    currentCount: number, 
    draftTotal: number, 
    target?: number
  ): void {
    // 表示テキストを構築
    this.statusBarItem.show();
  }
}
```

### Phase 4: 統合（完了）

✅ `src/extension.ts` で全体を統合
✅ コマンド登録
✅ デバッグコマンド追加

```typescript
import * as vscode from 'vscode';
import { WordCountController } from './wordCountController';

let controller: WordCountController | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('NoktoKalkulo が起動しました');

  controller = new WordCountController();
  context.subscriptions.push(controller);

  // コマンド登録: 文字数カウント
  const countCommand = vscode.commands.registerCommand(
    'nokto.countWords',
    () => {
      if (controller) {
        controller.updateWordCount();
        vscode.window.showInformationMessage('文字数をカウントしました');
      }
    }
  );
  context.subscriptions.push(countCommand);

  // コマンド登録: 詳細な文字数情報を表示
  const detailedCountCommand = vscode.commands.registerCommand(
    'nokto.showDetailedCount',
    () => {
      if (controller) {
        controller.showDetailedCount();
      }
    }
  );
  context.subscriptions.push(detailedCountCommand);

  // デバッグコマンド
  const debugCommand = vscode.commands.registerCommand(
    'nokto.debugCount',
    () => {
      if (controller) {
        controller.debugCount();
      }
    }
  );
  context.subscriptions.push(debugCommand);
}

export function deactivate() {
  if (controller) {
    controller.dispose();
    controller = undefined;
  }
}
```

## 実装済み機能

### ✅ コア機能

- [x] Markdown原稿の文字数カウント
- [x] 文字要素のみをカウント（ひらがな、カタカナ、漢字、英数字）
- [x] Markdown要素の除外（見出し、リスト、コードブロック等）
- [x] ステータスバーへのリアルタイム表示
- [x] ディレクトリ合計文字数の計算
- [x] 目標文字数の設定
- [x] ディレクトリ固有の設定ファイル（`.nokto.json`）
- [x] セリフと地の文の分離カウント
- [x] 詳細情報表示（セリフと地の文の文字数と割合）
- [x] OutputChannelへの詳細情報出力
- [x] 出力パネルのちらつき防止（デバウンス + 差分更新）

### 🎯 パフォーマンス最適化

#### 出力パネルのちらつき防止

テキスト編集時の出力パネル更新でちらつきが発生する問題に対し、以下の最適化を実装：

**1. デバウンス処理**
```typescript
// wordCountController.ts
private debounceTimer: NodeJS.Timeout | null = null;

private async onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent): Promise<void> {
  if (this.isManuscriptFile(e.document)) {
    // 前のタイマーをクリア
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    // 最後の変更から1秒待機してから更新
    this.debounceTimer = setTimeout(async () => {
      await this.updateWordCount();
      if (this.autoShowDetailedInfo) {
        await this.showDetailedCount(true);
      }
    }, 1000);
  }
}
```

**2. 差分更新によるちらつき軽減**
```typescript
// wordCountController.ts
private lastOutputContent: string | null = null;

async showDetailedCount(autoUpdate: boolean = false): Promise<void> {
  // 出力内容を生成
  let outputContent = 'NoktoKalkulo\n\n...';
  
  // 前回の内容と異なる場合のみ更新
  if (this.lastOutputContent !== outputContent) {
    this.lastOutputContent = outputContent;
    this.outputChannel.clear();
    // ...出力処理
  }
}
```

**効果:**
- 連続入力時の更新頻度を削減（1文字ごと → 1秒間隔）
- 不要な再描画を回避（変更がない場合はスキップ）
- エディタのフォーカスを保持したまま更新

**設定:**
デバウンス時間は `wordCountController.ts` の `setTimeout` の第2引数で調整可能（デフォルト: 1000ms）

### 📋 今後の拡張候補

- [ ] プロットファイルからの目標文字数自動抽出
- [ ] リアルタイム文字数グラフ
- [ ] 執筆速度の計測
- [ ] セクションごとの文字数内訳
- [ ] 執筆履歴の記録
- [ ] カスタマイズ可能なカウント規則

---

## デバッグ実行

### VS Codeでデバッグ

1. `F5` キーを押す
2. 新しいVS Codeウィンドウが開く（Extension Development Host）
3. 原稿ファイル（draft.md）を開く
4. ステータスバーに文字数が表示されることを確認

### ログ出力確認

- デバッグコンソールでログを確認
- `console.log()` で動作を追跡

---

## テスト実行

```bash
# すべてのテストを実行
npm test

# 特定のテストのみ実行
npm test -- --grep "ManuscriptParser"
```

---

## パッケージング

### VSIX ファイル作成

```bash
# vsce をインストール（初回のみ）
npm install -g @vscode/vsce

# パッケージ作成
vsce package

# 出力: nocturne-word-count-0.1.0.vsix
```

### インストール

```bash
# コマンドラインからインストール
code --install-extension nocturne-word-count-0.1.0.vsix
```

または、VS Code の UI から：

1. 拡張機能ビュー（Ctrl+Shift+X）
2. `...` メニュー → 「VSIX からインストール...」
3. vsix ファイルを選択

---

## トラブルシューティング

### 文字数が正しくカウントされない

1. デバッグコンソールでログを確認
2. `parser.debug()` メソッドで各ステップを確認
3. テストケースと照合

### ステータスバーに表示されない

1. `isManuscriptFile()` のパス判定を確認
2. 設定 `nocturne.wordCount.showInStatusBar` を確認
3. ステータスバーアイテムの作成タイミングを確認

---

## 開発ワークフロー

### 日常的な開発作業

```bash
# 依存関係のインストール（初回のみ）
npm install

# 開発モード（監視モード）で起動
npm run watch

# F5キーでデバッグ実行
# -> 新しいVS Codeウィンドウで拡張機能をテスト
```

### テストの実行

```bash
# すべてのテストを実行
npm test

# リントチェック
npm run lint
```

### ビルド

```bash
# 開発用ビルド
npm run compile

# 本番用ビルド（最小化）
npm run package
```

---

## 参考リンク

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Samples](https://github.com/microsoft/vscode-extension-samples)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
