# マーケットプレイス公開チェックリスト

公開前の最終確認リストです。

## ✅ 完了済み

- [x] Publisher ID を `j-g-ishiko` に設定
- [x] Repository URL を `https://github.com/jgishiko/nokto-kalkulo.git` に設定
- [x] アイコンファイル `icon.png` を配置
- [x] MIT License を設定
- [x] CHANGELOG.md を作成
- [x] README.md を拡充
- [x] .vscodeignore を設定（CHANGELOG.mdは含める）

## 📋 公開前の確認事項

### 1. vsce のインストール

```bash
npm install -g @vscode/vsce
```

### 2. パッケージのビルドとテスト

```bash
# 依存関係のインストール
npm install

# コンパイル
npm run compile

# Lintチェック
npm run lint

# パッケージング（ドライラン）
vsce package

# 生成されたVSIXファイルをテストインストール
code --install-extension nokto-kalkulo-0.1.0.vsix
```

### 3. Visual Studio Marketplace の準備

1. **Publisher アカウントの作成**
   - <https://marketplace.visualstudio.com/manage> にアクセス
   - Azure DevOps アカウントでログイン
   - Publisher `j-g-ishiko` を作成

2. **Personal Access Token (PAT) の作成**
   - Azure DevOps で PAT を生成
   - Name: VS Code Marketplace Publishing
   - Organization: All accessible organizations
   - Scopes:
     - **Marketplace: Manage** （必須）
   - Expiration: 1年など適切な期間を設定
   - トークンをコピーして安全な場所に保存

3. **vsce でログイン**

```bash
vsce login j-g-ishiko
# PAT トークンを入力
```

### 4. 最終チェック

- [ ] icon.png が 128x128px であることを確認
- [ ] README.md に機能説明がすべて含まれていることを確認
- [ ] package.json の description が適切かを確認
- [ ] keywords が適切に設定されているかを確認
- [ ] バージョン番号が適切かを確認 (0.1.0)

### 5. 公開

```bash
# パッケージング
vsce package

# 公開
vsce publish
```

## 📝 公開後の作業

- [ ] Marketplace のページを確認
  - <https://marketplace.visualstudio.com/items?itemName=j-g-ishiko.nokto-kalkulo>
- [ ] インストールして動作確認
- [ ] GitHub に v0.1.0 タグを作成
- [ ] GitHub Releases でリリースノートを公開

```bash
git tag v0.1.0
git push origin v0.1.0
```

## 🔄 更新時の手順

1. **コードを修正**
2. **CHANGELOG.md を更新**
3. **バージョン番号を更新** (package.json)
4. **再公開**

```bash
# パッチバージョンアップ (0.1.0 → 0.1.1)
vsce publish patch

# マイナーバージョンアップ (0.1.0 → 0.2.0)
vsce publish minor

# メジャーバージョンアップ (0.1.0 → 1.0.0)
vsce publish major
```

## ⚠️ 注意事項

- **一度公開したバージョンは削除できません**（非推奨にすることは可能）
- **公開後24時間は新しいバージョンを公開できません**（緊急時を除く）
- **アイコンやスクリーンショットは後から追加・変更可能です**
- **説明文やタグは Marketplace の管理ページから変更可能です**

## 🆘 トラブルシューティング

### エラー: "ERROR The Personal Access Token verification has failed"

- PAT の Scope に "Marketplace: Manage" が含まれているか確認
- PAT の有効期限が切れていないか確認
- `vsce logout` してから `vsce login` を再実行

### エラー: "Make sure to edit the README.md file before you publish"

- README.md に実質的な内容が含まれているか確認
- テンプレートのままになっていないか確認

### エラー: "ERROR Missing publisher name"

- package.json の "publisher" フィールドが設定されているか確認

## 📚 参考リンク

- [VS Code Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)
- [Marketplace Publisher Portal](https://marketplace.visualstudio.com/manage)
