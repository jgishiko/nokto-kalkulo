# Nocturne Word Count - 開発ガイド

ノクターンノベルズ原稿用文字数カウントVS Code拡張機能の開発手順

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
cd c:\Users\yoshihisa\OneDrive\Documents\GitHub\Nocturne

# Yeomanで拡張機能プロジェクトを作成
yo code
```

### Yeomanの質問に回答

```text
? What type of extension do you want to create?
  → New Extension (TypeScript)

? What's the name of your extension?
  → Nocturne Word Count

? What's the identifier of your extension?
  → nocturne-word-count

? What's the description of your extension?
  → ノクターンノベルズ原稿の文字数カウント機能

? Initialize a git repository?
  → No（既存のリポジトリを使用）

? Which bundler to use?
  → esbuild

? Which package manager to use?
  → npm
```

---

## ファイル構成

プロジェクト作成後の推奨構成：

```text
nocturne-word-count/
├── package.json                  # 拡張機能マニフェスト
├── tsconfig.json                 # TypeScript設定
├── .vscodeignore                # パッケージング時の除外ファイル
├── src/
│   ├── extension.ts             # エントリーポイント
│   ├── wordCountController.ts   # メインコントローラー
│   ├── manuscriptParser.ts      # パーサー（.vscodeから移動）
│   ├── statusBarManager.ts      # ステータスバー管理
│   └── targetExtractor.ts       # プロット目標抽出（後で実装）
├── test/
│   └── suite/
│       ├── extension.test.ts
│       └── parser.test.ts
└── README.md
```

---

## package.json の設定

重要な設定項目：

```json
{
  "name": "nocturne-word-count",
  "displayName": "Nocturne Word Count",
  "description": "ノクターンノベルズ原稿の文字数カウント",
  "version": "0.1.0",
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
        "command": "nocturne.countWords",
        "title": "Nocturne: Count Manuscript Words"
      }
    ],
    "configuration": {
      "title": "Nocturne Word Count",
      "properties": {
        "nocturne.wordCount.enabled": {
          "type": "boolean",
          "default": true,
          "description": "文字数カウント機能を有効にする"
        },
        "nocturne.wordCount.targetWords": {
          "type": "number",
          "default": 5000,
          "description": "目標文字数"
        },
        "nocturne.wordCount.showInStatusBar": {
          "type": "boolean",
          "default": true,
          "description": "ステータスバーに表示"
        }
      }
    }
  }
}
```

---

## 開発手順

### Phase 1: パーサー実装（1-2時間）

1. `.vscode/manuscriptParser.ts` を `src/` へコピー
2. ユニットテストを作成（`test/suite/parser.test.ts`）
3. テストを実行して動作確認

```bash
# テスト実行
npm test
```

### Phase 2: コントローラー実装（1-2時間）

1. `src/wordCountController.ts` を作成
2. ドキュメント変更の監視を実装
3. パーサーと連携

```typescript
// wordCountController.ts の骨格
import * as vscode from 'vscode';
import { ManuscriptParser } from './manuscriptParser';

export class WordCountController {
  private parser: ManuscriptParser;
  private disposable: vscode.Disposable;

  constructor() {
    this.parser = new ManuscriptParser();
    
    // ドキュメント変更を監視
    const subscriptions: vscode.Disposable[] = [];
    
    vscode.window.onDidChangeActiveTextEditor(
      this.onDidChangeActiveTextEditor,
      this,
      subscriptions
    );
    
    vscode.workspace.onDidChangeTextDocument(
      this.onDidChangeTextDocument,
      this,
      subscriptions
    );
    
    this.disposable = vscode.Disposable.from(...subscriptions);
    this.updateWordCount();
  }

  private onDidChangeActiveTextEditor(editor?: vscode.TextEditor) {
    this.updateWordCount();
  }

  private onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent) {
    if (this.isManuscriptFile(e.document)) {
      this.updateWordCount();
    }
  }

  private isManuscriptFile(document: vscode.TextDocument): boolean {
    // manuscript フォルダ内のmdファイルかチェック
    return document.languageId === 'markdown' && 
           document.uri.fsPath.includes('manuscript');
  }

  private updateWordCount() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !this.isManuscriptFile(editor.document)) {
      return;
    }

    const content = editor.document.getText();
    const count = this.parser.countWords(content);
    
    // ステータスバーに表示（Phase 3で実装）
    console.log(`文字数: ${count}字`);
  }

  dispose() {
    this.disposable.dispose();
  }
}
```

### Phase 3: ステータスバー実装（30分）

1. `src/statusBarManager.ts` を作成
2. コントローラーと連携

```typescript
// statusBarManager.ts の骨格
import * as vscode from 'vscode';

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
  }

  update(count: number, target?: number) {
    if (target) {
      this.statusBarItem.text = `📝 ${count.toLocaleString()}字 / 目標: ${target.toLocaleString()}字`;
    } else {
      this.statusBarItem.text = `📝 ${count.toLocaleString()}字`;
    }
    
    this.statusBarItem.show();
  }

  hide() {
    this.statusBarItem.hide();
  }

  dispose() {
    this.statusBarItem.dispose();
  }
}
```

### Phase 4: 統合（30分）

`src/extension.ts` で全体を統合：

```typescript
import * as vscode from 'vscode';
import { WordCountController } from './wordCountController';

let controller: WordCountController;

export function activate(context: vscode.ExtensionContext) {
  console.log('Nocturne Word Count が起動しました');

  controller = new WordCountController();
  context.subscriptions.push(controller);

  // コマンド登録
  const disposable = vscode.commands.registerCommand(
    'nocturne.countWords',
    () => {
      vscode.window.showInformationMessage('文字数をカウントしています...');
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  if (controller) {
    controller.dispose();
  }
}
```

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

## 次のステップ

- [ ] Phase 1: パーサー実装・テスト
- [ ] Phase 2: コントローラー実装
- [ ] Phase 3: ステータスバー実装
- [ ] Phase 4: 統合・デバッグ
- [ ] パッケージング・インストール
- [ ] 実際の原稿で動作確認

---

## 参考リンク

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Samples](https://github.com/microsoft/vscode-extension-samples)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
