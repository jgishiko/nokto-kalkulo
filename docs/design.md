# NoktoKalkulo - VS Code拡張機能設計

小説原稿の本文文字数カウント拡張機能

---

## 機能概要

Markdown原稿ファイル内の文字数を正確にカウントし、ステータスバーに表示する。

---

## カウント対象の仕様

### ✅ カウントする文字

- 原稿内のすべてのテキスト
- 日本語文字（ひらがな、カタカナ、漢字）
- 英数字
- 記号・句読点

### ❌ カウントしない文字

1. **Markdown記法**
   - 見出し記号：`#`、`##`、`###`
   - リスト記号：`-`、`*`、`+`、`1.`
   - 強調記号：`**`、`*`、`__`、`_`
   - コードブロック：` ``` `

2. **HTMLコメント**
   - `<!-- ... -->` 内のすべてのテキスト
   - 複数行にまたがるコメントも除外

3. **空白文字**
   - 半角スペース
   - 全角スペース
   - タブ文字（`\t`）
   - 改行コード（`\n`、`\r\n`）

---

## UI設計

### ステータスバー表示

```
📝 5,432字 / 目標: 5,000字
```

- 左側のアイコン：📝（原稿を示す）
- 現在の文字数：カンマ区切りで表示
- 目標文字数：プロット情報から自動取得（オプション）
- 色：
  - 通常：白
  - 目標達成：緑
  - 超過（+10%以上）：黄色

### コマンドパレット

- `NoktoKalkulo: Count Manuscript Words` - 手動カウント実行
- `NoktoKalkulo: Show Word Count Details` - 詳細情報表示

---

## 実装方針

### アーキテクチャ

```
extension.ts
├── activate() - 拡張機能の起動
├── WordCountController - メインコントローラー
│   ├── updateWordCount() - 文字数更新
│   └── onDocumentChange() - ドキュメント変更監視
├── ManuscriptParser - 原稿パーサー
│   ├── removeMarkdownElements() - Markdown要素除去
│   ├── normalizeDialogue() - 会話文の正規化
│   ├── normalizeSpecialCharacters() - 特殊文字の正規化
│   └── countWords() - 文字数カウント
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
    // 1. Markdown要素を除去
    let text = this.removeMarkdownElements(content);
    
    // 2. 会話文を1文字に置き換え
    text = this.normalizeDialogue(text);
    
    // 3. 特殊文字を正規化
    text = this.normalizeSpecialCharacters(text);
    
    // 4. 改行と空白を除外
    text = text.replace(/\s+/g, '');
    
    // 5. 文字数をカウント
    return text.length;
  }

  /**
   * Markdown要素を除去
   */
  private removeMarkdownElements(content: string): string {
    // HTMLコメント、タグ、コードブロック、引用行、見出し行などを除去
    // 詳細は実装参照
  }

  /**
   * 会話文を正規化（「」内を1文字に）
   */
  private normalizeDialogue(text: string): string {
    return text.replace(/「[^」]*」/g, 'D');
  }

  /**
   * 特殊文字を正規化
   */
  private normalizeSpecialCharacters(text: string): string {
    // 三点リーダー（…）→ 2文字
    text = text.replace(/…/g, 'EE');
    // ダッシュ（―）→ 1文字（そのまま）
    return text;
  }
}
```

---

## 設定項目

`settings.json` で以下を設定可能：

```json
{
  "nocturne.wordCount.enabled": true,
  "nocturne.wordCount.targetWords": 5000,
  "nocturne.wordCount.autoTarget": true,
  "nocturne.wordCount.showInStatusBar": true,
  "nocturne.wordCount.updateDelay": 500
}
```

- `enabled` - 機能の有効/無効
- `targetWords` - 目標文字数（手動設定）
- `autoTarget` - プロットから目標を自動取得
- `showInStatusBar` - ステータスバー表示の有効/無効
- `updateDelay` - 更新の遅延時間（ミリ秒）

---

## 目標文字数の自動取得（オプション機能）

プロットファイル（`plot/plot.md`）から目標文字数を自動取得：

1. 現在のファイルから作品フォルダを特定
2. `plot/plot.md` を読み込み
3. 以下のパターンを検索：
   - `合計：X,XXX～X,XXX字`
   - `推奨文字数：X,XXX字`
   - `目標文字数: X,XXX字`
4. 範囲指定の場合は中間値を使用

---

## ファイルスコープ

すべてのMarkdownファイル（`.md`）が対象です。

---

## テストケース

### 1. 基本的な文字数カウント

```markdown
## 本文

これはテスト文章です。
```

期待結果：`11字`

### 2. コメント除外

```markdown
## 本文

<!-- これはコメント -->
本文はこれだけ。
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

## 将来の拡張機能（Phase 2）

- リアルタイム文字数グラフ
- 執筆速度の計測
- セクションごとの文字数内訳
- 複数ファイルの合計文字数
- プロット配分との比較表示
- 執筆履歴の記録
