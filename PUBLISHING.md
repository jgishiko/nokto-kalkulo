# マーケットプレイス公開準備チェックリスト

## 📋 必須項目

### ✅ 完了済み

- [x] **ライセンス選択** - MIT License（コミュニティ標準）
- [x] **CHANGELOG.md** - バージョン履歴の記録
- [x] **README.md 拡充** - 機能説明、使い方、設定方法
- [x] **package.json 更新** - publisher, repository, keywords追加

### ⚠️ 要対応（公開前に必ず設定）

- [x] **package.json の YOUR-PUBLISHER-ID を置換**
  - Publisher ID: `j-g-ishiko` に設定済み
  - Visual Studio Marketplace でPublisherを作成してください
  - <https://marketplace.visualstudio.com/manage>

- [x] **package.json の repository URL を確認**
  - GitHubのリポジトリURL: `https://github.com/jgishiko/nokto-kalkulo.git`
  - 正しく設定済み

- [x] **アイコン画像**
  - ファイル: `icon.png` が存在
  - package.jsonに設定済み: `"icon": "icon.png"`
  - ※サイズが128x128pxであることを確認してください

- [ ] **CHANGELOG.md の整理**
  - [Unreleased] セクションを v0.1.0 に統合するか検討
  - リリースノートの最終確認

- [ ] **スクリーンショット/GIFを作成**（推奨）
  - 実際の動作画面をキャプチャ
  - ステータスバー表示の様子
  - 詳細情報表示の様子
  - README.md に追加

## 🎨 推奨項目

- [ ] **ギャラリーバナー設定**
  - package.jsonに追加:
    ```json
    "galleryBanner": {
      "color": "#1e1e1e",
      "theme": "dark"
    }
    ```
  - マーケットプレイスページ上部の背景色とテーマを指定
  - 注: 画像のアップロードではなく、色設定のみ

- [ ] **.vscodeignore の確認**
  - 不要なファイルを除外してVSIXサイズを削減
  - `docs/`, `test/`, `.vscode/`, `*.md`（README以外）など

- [ ] **カテゴリの見直し**
  - 現在: "Other"
  - 候補: "Formatters", "Other"
  - より適切なカテゴリを検討

- [ ] **タグの追加**
  - package.json の keywords を充実
  - 検索されやすいキーワードを追加

## 🧪 テスト項目

- [ ] **各種OS/VS Codeバージョンでテスト**
  - Windows
  - macOS
  - Linux

- [ ] **パッケージング確認**

  ```bash
  npm run package
  code --install-extension nokto-kalkulo-*.vsix
  ```

- [ ] **機能テスト**
  - 文字数カウントが正しく動作するか
  - ステータスバー表示
  - 設定変更の反映
  - 会話文、三点リーダー、ダッシュのカウント

## 📤 公開手順

1. **Publisher アカウント作成**
   - <https://marketplace.visualstudio.com/manage>
   - Azure DevOps アカウントでログイン

2. **Personal Access Token 作成**
   - Azure DevOps で PAT を生成
   - Scope: "Marketplace" の "Manage" 権限

3. **vsce インストール**

   ```bash
   npm install -g @vscode/vsce
   ```

4. **パブリッシャーログイン**

   ```bash
   vsce login YOUR-PUBLISHER-ID
   ```

5. **パッケージング & 公開**

   ```bash
   vsce package
   vsce publish
   ```

## 🔄 更新時の手順

1. **バージョン番号更新**
   - package.json の version を更新
   - CHANGELOG.md に変更内容を記載

2. **再公開**

   ```bash
   vsce publish patch  # 0.1.0 → 0.1.1
   vsce publish minor  # 0.1.0 → 0.2.0
   vsce publish major  # 0.1.0 → 1.0.0
   ```

## ⚖️ ライセンスについて

### MIT License を選択した理由

✅ **おすすめポイント:**

- 最も広く使われているオープンソースライセンス
- 商用利用・改変・再配布が自由
- VS Code 拡張機能の標準的な選択
- GitHub でも推奨
- 責任制限条項があり開発者を保護

❌ **制限事項:**

- コピーライト表示とライセンス文の保持が必要
- 保証なし（"AS IS"）

### 他のライセンスとの比較

| ライセンス | 特徴 | 適用例 |
|-----------|------|--------|
| **MIT** | 非常に寛容、制限最小 | VS Code, React, Node.js |
| **Apache 2.0** | 特許権の明示的な付与 | Android, Kubernetes |
| **GPL v3** | コピーレフト、改変版も同ライセンス | Linux, WordPress |
| **ISC** | MITとほぼ同等でより簡潔 | npm, OpenBSD |

**結論:** 個人開発の VS Code 拡張機能には **MIT License が最適** です。

## 📊 公開後のモニタリング

- インストール数の確認
- レビュー・評価の確認
- Issue/バグ報告への対応
- 機能要望の検討

## 🔗 参考リンク

- [VS Code Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Choose a License](https://choosealicense.com/)
