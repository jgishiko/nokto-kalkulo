# NoktoKalkulo - VS Code拡張機能設計

小説原稿の本文文字数カウント拡張機能

---

## 機能概要

Markdown原稿ファイル内の文字数を正確にカウントし、ステータスバーに表示する。

### 主要機能

1. **文字数カウント** - 文字要素のみを正確にカウント
2. **ディレクトリ合計** - 同じディレクトリ配下の全ファイルの合計を計算
3. **目標達成度表示** - 目標文字数に対する進捗をパーセンテージで表示
4. **セリフと地の文の分離** - かぎ括弧内のセリフと地の文を自動判別してカウント
5. **詳細情報表示** - ステータスバークリックまたはコマンドで詳細な内訳を表示

---

## カウント対象の仕様

### ✅ カウントする文字

原稿内の **文字要素** のみをカウント：

- **日本語文字**
  - ひらがな（\u3040-\u309F）
  - カタカナ（\u30A0-\u30FF）
  - 漢字（\u4E00-\u9FFF）

- **英数字**
  - アルファベット（a-z, A-Z）
  - 全角アルファベット（\uFF21-\uFF3A, \uFF41-\uFF5A）
  - 半角数字（0-9）
  - 全角数字（\uFF10-\uFF19）

### ❌ カウントしない文字

1. **記号・句読点**
   - 句読点：`。`、`、`
   - 括弧：`「」`、`『』`、`（）`、`[]`
   - 感嘆符・疑問符：`！`、`？`、`!`、`?`
   - 三点リーダー：`…`
   - ダッシュ：`―`、`—`
   - その他の記号類

2. **Markdown記法**
   - 見出し行全体：`#`、`##`、`###`で始まる行
   - リスト記号：`-`、`*`、`+`、`1.`
   - 強調記号：`**`、`*`、`__`、`_`（内容は残す）
   - コードブロック：` ``` `で囲まれた部分
   - インラインコード：`` ` ``で囲まれた部分
   - 引用行全体：`>`で始まる行
   - リンク：`[text](url)` のURL部分（テキストは残す）

3. **HTMLコメント**
   - `<!-- ... -->` 内のすべてのテキスト
   - 複数行にまたがるコメントも除外

4. **HTMLタグ**
   - `<tag>...</tag>` のタグ部分

5. **空白文字**
   - 半角スペース
   - 全角スペース
   - タブ文字（`\t`）
   - 改行コード（`\n`、`\r\n`）

---

## UI設計

### ステータスバー表示

**目標文字数を設定している場合（複数ファイル）**：
```
�️ 1,234字 | 3,456字 / 5,000字 (69%)
```

**目標文字数を設定している場合（単一ファイル）**：
```
🖊️ 1,234字 / 5,000字 (25%)
```

**目標文字数を設定していない場合（複数ファイル）**：
```
🖊️ 1,234字 | 3,456字
```

**目標文字数を設定していない場合（単一ファイル）**：
```
🖊️ 1,234字
```

**表示要素**：
- アイコン：🖊️（ペンシルアイコン、実装では `$(edit)` を使用）
- 現在のファイルの文字数：`1,234字`（カンマ区切り）
- ディレクトリ合計文字数：`3,456字`（複数ファイルの場合のみ表示）
- 目標文字数：`5,000字`（設定した場合のみ）
- 達成率：`(69%)`（目標文字数設定時のみ）

**背景色**（`showBackgroundColor` が `true` の場合）：
- **赤色**：合計文字数 ≤ 最小文字数（`minWords` 設定時）
- **黄色**：合計文字数 ≥ 目標文字数（`targetWords` 設定時）
- **デフォルト**：最小文字数 < 合計文字数 < 目標文字数

> **注意**: 最小文字数（`minWords`）はステータスバーには表示されず、背景色の制御にのみ使用されます。

### コマンドパレット

- `NoktoKalkulo: Count Manuscript Words` - 手動カウント実行・通知表示
- `NoktoKalkulo: Show Detailed Word Count` - 詳細な文字数情報をOutputChannelに表示
- `nokto.debugCount`（開発者向け） - デバッグ情報をコンソールに出力

### 詳細情報表示

ステータスバーをクリックするか、コマンドパレットから `Show Detailed Word Count` を実行すると、**出力パネル（OUTPUT）** に以下の情報が表示されます：

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

---

## 実装方針

### アーキテクチャ

```
extension.ts
├── activate() - 拡張機能の起動
├── WordCountController - メインコントローラー
│   ├── updateWordCount() - 文字数更新
│   ├── showDetailedCount() - 詳細情報表示
│   ├── countFilesInDirectoryDetailed() - ディレクトリ内の詳細カウント
│   └── onDocumentChange() - ドキュメント変更監視
├── ManuscriptParser - 原稿パーサー
│   ├── countWords() - 文字数カウント
│   ├── countWordsDetailed() - 詳細カウント（セリフと地の文）
│   ├── countDialogue() - セリフのカウント
│   ├── removeMarkdownElements() - Markdown要素除去
│   └── countCharacters() - 文字要素カウント
└── StatusBarManager - ステータスバー管理
    ├── update() - 表示更新
    └── setTarget() - 目標文字数設定
```

### ManuscriptParser 実装詳細

```typescript
class ManuscriptParser {
  /**
   * 文字数をカウント
   * @param content - Markdownファイルの全内容
   * @returns 文字数
   */
  countWords(content: string): number {
    if (!content) {
      return 0;
    }

    // 1. Markdown要素を除去
    let text = this.removeMarkdownElements(content);
    
    // 2. 文字要素のみを抽出してカウント
    return this.countCharacters(text);
  }

  /**
   * 詳細な文字数をカウント（セリフと地の文を分離）
   * @param content - Markdownファイルの全内容
   * @returns 詳細な文字数情報
   */
  countWordsDetailed(content: string): WordCountResult {
    if (!content) {
      return { total: 0, dialogue: 0, narration: 0 };
    }

    // 1. Markdown要素を除去
    let text = this.removeMarkdownElements(content);

    // 2. セリフと地の文を分離してカウント
    const dialogueCount = this.countDialogue(text);
    const totalCount = this.countCharacters(text);
    const narrationCount = totalCount - dialogueCount;

    return {
      total: totalCount,
      dialogue: dialogueCount,
      narration: narrationCount
    };
  }

  /**
   * セリフ（かぎ括弧内のテキスト）の文字数をカウント
   * @param text テキスト
   * @returns セリフの文字数
   */
  private countDialogue(text: string): number {
    // かぎ括弧「」と二重かぎ括弧『』の両方を対象とする
    const dialogueRegex = /[「『]([^」』]*)[」』]/g;
    let matches;
    let dialogueText = '';
    
    while ((matches = dialogueRegex.exec(text)) !== null) {
      dialogueText += matches[1];
    }

    return this.countCharacters(dialogueText);
  }

  /**
   * 文字要素のみをカウント
   * ひらがな、カタカナ、漢字、アルファベット、数字のみ
   */
  private countCharacters(text: string): number {
    // 文字要素のみにマッチする正規表現
    const characterRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFFa-zA-Z0-9\uFF21-\uFF3A\uFF41-\uFF5A\uFF10-\uFF19]/g;
    const matches = text.match(characterRegex);
    return matches ? matches.length : 0;
  }

  /**
   * Markdown要素を除去
   */
  private removeMarkdownElements(content: string): string {
    // HTMLコメント除外
    let text = content.replace(/<!--[\s\S]*?-->/g, '');

    // HTMLタグ除外
    text = text.replace(/<[^>]*>/g, '');

    // コードブロック除外
    text = text.replace(/```[\s\S]*?```/g, '');

    // インラインコード除外
    text = text.replace(/`[^`]+`/g, '');

    // 引用行全体を除外（> で始まる行）
    text = text.replace(/^>+\s*.*$/gm, '');

    // 見出し行全体を除外（メタデータとして扱う）
    text = text.replace(/^#+\s+.*$/gm, '');

    // リスト記号除外
    text = text.replace(/^[*\-+]\s+/gm, '');
    text = text.replace(/^\d+\.\s+/gm, '');

    // 強調記号除外（内容は残す）
    text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
    text = text.replace(/\*([^*]+)\*/g, '$1');
    text = text.replace(/__([^_]+)__/g, '$1');
    text = text.replace(/_([^_]+)_/g, '$1');

    // リンク除外（テキスト部分は残す）
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    return text;
  }

  /**
   * デバッグ用：各ステップの結果を出力
   */
  debug(content: string): void {
    console.log('=== ManuscriptParser Debug ===');
    console.log('1. Original:', content.substring(0, 100));

    const step1 = this.removeMarkdownElements(content);
    console.log('2. After removeMarkdown:', step1.substring(0, 100));

    const count = this.countCharacters(step1);
    console.log('3. Character count:', count);
    
    // 抽出された文字の一部を表示
    const characterRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFFa-zA-Z0-9\uFF21-\uFF3A\uFF41-\uFF5A\uFF10-\uFF19]/g;
    const chars = step1.match(characterRegex) || [];
    console.log('4. Extracted characters (first 50):', chars.slice(0, 50).join(''));
    
    console.log('Final count:', count);
    console.log('==============================');
  }
}
```

---

## 設定項目

### VS Code設定（settings.json）

```json
{
  "nokto.wordCount.enabled": true,
  "nokto.wordCount.minWords": 0,
  "nokto.wordCount.targetWords": 5000,
  "nokto.wordCount.showInStatusBar": true,
  "nokto.wordCount.showBackgroundColor": false
}
```

- `enabled` - 機能の有効/無効
- `minWords` - 最小文字数（背景色制御用、ステータスバーには表示されない）
- `targetWords` - 目標文字数
- `showInStatusBar` - ステータスバー表示の有効/無効
- `showBackgroundColor` - 背景色表示の有効/無効

### ディレクトリ固有設定（.nokto.json）

原稿ファイルのディレクトリに `.nokto.json` を配置することで、その作品専用の設定を指定可能：

```json
{
  "enabled": true,
  "minWords": 3000,
  "targetWords": 10000,
  "showBackgroundColor": true
}
```

**設定の優先順位**：
1. `.nokto.json`（ディレクトリ固有設定）
2. `settings.json`（VS Code設定）

**読み込みタイミング**：
- ファイルを開いたとき
- エディタを切り替えたとき
- ドキュメントを変更したとき
- 設定ファイルを変更したとき

**minWordsの用途**：
- ステータスバーには表示されない
- 背景色の制御にのみ使用
- 最小文字数以下の場合、背景色を赤に設定（`showBackgroundColor: true` の場合）

---

## ディレクトリ合計カウント機能

現在のファイルだけでなく、同じディレクトリ配下（サブディレクトリを含む）のすべての `.md` ファイルの合計文字数を計算して表示します。

### 実装詳細

```typescript
/**
 * 指定したディレクトリ（配下のサブディレクトリを含む）内の全ファイルの合計文字数を取得
 */
private async countFilesInDirectory(directoryUri: vscode.Uri): Promise<number> {
  try {
    // ディレクトリ配下のすべてのmarkdownファイルを検索（サブディレクトリも含む）
    const pattern = new vscode.RelativePattern(directoryUri, '**/*.md');
    const files = await vscode.workspace.findFiles(pattern);

    // 各ファイルの文字数を合計
    let totalCount = 0;
    for (const fileUri of files) {
      const doc = await vscode.workspace.openTextDocument(fileUri);
      const content = doc.getText();
      totalCount += this.parser.countWords(content);
    }

    return totalCount;
  } catch (error) {
    console.error('Error calculating directory total:', error);
    return 0;
  }
}
```

### 使用例

```
project/
├── chapter1.md (1,000字)
├── chapter2.md (1,500字)
└── notes/
    └── outline.md (500字)
```

`chapter1.md` を開いた場合：
- 現在のファイル：`1,000字`
- ディレクトリ合計：`3,000字`（全ファイルの合計）

## ファイルスコープ

すべてのMarkdownファイル（`.md`）が対象です。

- 現在のエディタで開いているファイルが `.md` の場合にカウントを実行
- ディレクトリ合計も `.md` ファイルのみをカウント

---

## テストケース

### 1. 基本的な文字数カウント

```markdown
## 本文

これはテスト文章です。
```

期待結果：`11字`（「これはテスト文章です」のみ、見出し行は除外）

### 2. コメント除外

```markdown
## 本文

<!-- これはコメント -->
本文はこれだけ。
```

期待結果：`8字`（「本文はこれだけ」のみ）

### 3. Markdown記法除外

```markdown
## 本文

### 見出し

これは**強調**された文章です。
```

期待結果：`12字`（「これは強調された文章です」のみ、見出し行と強調記号は除外）

### 4. 記号・句読点除外

```markdown
## 本文

これは、テストです！？「会話文」も含みます。
```

期待結果：`17字`（「これはテストです会話文も含みます」、記号・句読点は除外）

### 5. 見出し除外

```markdown
# タイトル

## 第一章

これが本文です。

## 第二章

これも本文です。
```

期待結果：`14字`（「これが本文です」+「これも本文です」、見出し行は除外）

### 6. 全角・半角混在

```markdown
## 本文

これはABCと123です。
テストTESTてすと1234５６７８
```

期待結果：`29字`（全角・半角問わず、文字要素のみカウント）

### 7. コードブロック除外

```markdown
## 本文

本文の前

```javascript
console.log("これはコード");
```

本文の後
```

期待結果：`7字`（「本文の前」+「本文の後」、コードブロックは除外）
```

期待結果：`8字`

### 3. Markdown記法除外

```markdown
## 本文

### 見出し

これは**強調**された文章です。
```

期待結果：`15字`（「見出し」+「これは強調された文章です」）

### 4. 空白除外

```markdown
## 本文

これは　テスト　です。
改行を含む文章。
```

期待結果：`17字`（空白と改行を除外）

### 5. 見出し除外

```markdown
# タイトル

## 第一章

これが本文です。

## 第二章

これも本文です。
```

期待結果：`14字`（「これが本文です」+「これも本文です」、見出し行は除外）

---

## 実装ファイル構成

```
nocturne-word-count/
├── package.json
├── tsconfig.json
├── src/
│   ├── extension.ts          # エントリーポイント
│   ├── wordCountController.ts
│   ├── manuscriptParser.ts
│   ├── statusBarManager.ts
│   └── targetExtractor.ts    # プロットから目標取得
├── test/
│   ├── suite/
│   │   ├── parser.test.ts
│   │   └── controller.test.ts
│   └── fixtures/
│       └── sample.md
└── README.md
```

---

## 開発手順

1. `yo code` で拡張機能プロジェクト作成
2. ManuscriptParser クラス実装
3. ユニットテスト作成・実行
4. WordCountController 実装
5. StatusBarManager 実装
6. 統合テスト
7. パッケージング・インストール

---

## 将来の拡張機能（Phase 2以降）

- リアルタイム文字数グラフ
- 執筆速度の計測
- セクションごとの文字数内訳
- プロットファイルからの目標文字数自動抽出
- 執筆履歴の記録
- カスタマイズ可能なカウント規則
  - 会話文（「」内）を1文字としてカウントするオプション
  - 三点リーダー（…）を2文字としてカウントするオプション
  - カンマ区切りの数値表現の扱い
