import * as vscode from 'vscode';
import { ManuscriptParser } from './manuscriptParser';
import { StatusBarManager } from './statusBarManager';

/**
 * WordCountController - 文字数カウントのメインコントローラー
 */
export class WordCountController {
  private parser: ManuscriptParser;
  private statusBar: StatusBarManager;
  private disposable: vscode.Disposable;

  constructor() {
    this.parser = new ManuscriptParser();
    this.statusBar = new StatusBarManager();
    
    // イベントリスナーを登録
    const subscriptions: vscode.Disposable[] = [];
    
    // エディタ切り替え時
    vscode.window.onDidChangeActiveTextEditor(
      this.onDidChangeActiveTextEditor,
      this,
      subscriptions
    );
    
    // ドキュメント変更時
    vscode.workspace.onDidChangeTextDocument(
      this.onDidChangeTextDocument,
      this,
      subscriptions
    );
    
    // 設定変更時
    vscode.workspace.onDidChangeConfiguration(
      this.onDidChangeConfiguration,
      this,
      subscriptions
    );
    
    this.disposable = vscode.Disposable.from(...subscriptions);
    
    // 初期カウント
    this.updateWordCount();
  }

  /**
   * エディタ切り替え時のハンドラ
   */
  private onDidChangeActiveTextEditor(): void {
    this.updateWordCount();
  }

  /**
   * ドキュメント変更時のハンドラ
   */
  private onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent): void {
    if (this.isManuscriptFile(e.document)) {
      this.updateWordCount();
    }
  }

  /**
   * 設定変更時のハンドラ
   */
  private onDidChangeConfiguration(e: vscode.ConfigurationChangeEvent): void {
    if (e.affectsConfiguration('nokto.wordCount')) {
      this.updateWordCount();
    }
  }

  /**
   * 原稿ファイルかどうかを判定
   */
  private isManuscriptFile(document: vscode.TextDocument): boolean {
    // Markdownファイルが対象
    return document.languageId === 'markdown';
  }

  /**
   * 設定を取得
   * @param fileUri 現在のファイルのURI（ディレクトリ固有の設定を読み込むため）
   */
  private async getConfiguration(fileUri?: vscode.Uri) {
    const config = vscode.workspace.getConfiguration('nokto.wordCount');
    const baseConfig = {
      enabled: config.get<boolean>('enabled', true),
      targetWords: config.get<number>('targetWords', 5000),
      showInStatusBar: config.get<boolean>('showInStatusBar', true),
    };

    // ディレクトリ固有の設定を読み込む
    if (fileUri) {
      const directoryConfig = await this.loadDirectoryConfig(fileUri);
      if (directoryConfig) {
        // enabled設定が.nokto.jsonにあれば優先
        if (directoryConfig.enabled !== undefined) {
          baseConfig.enabled = directoryConfig.enabled;
        }
        // targetWords設定が.nokto.jsonにあれば優先
        if (directoryConfig.targetWords !== undefined) {
          baseConfig.targetWords = directoryConfig.targetWords;
        }
      }
    }

    return baseConfig;
  }

  /**
   * ディレクトリ固有の設定ファイル（.nokto.json）を読み込む
   */
  private async loadDirectoryConfig(fileUri: vscode.Uri): Promise<{ enabled?: boolean; targetWords?: number } | null> {
    try {
      const dirUri = vscode.Uri.joinPath(fileUri, '..');
      const configUri = vscode.Uri.joinPath(dirUri, '.nokto.json');
      
      // TextDocumentとして読み込む
      const configDoc = await vscode.workspace.openTextDocument(configUri);
      const configText = configDoc.getText();
      const config = JSON.parse(configText);
      
      return config;
    } catch {
      // 設定ファイルが存在しない場合は null を返す
      return null;
    }
  }

  /**
   * 文字数を更新
   */
  async updateWordCount(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    const config = await this.getConfiguration(editor?.document.uri);

    // 機能が無効、またはエディタがない場合
    if (!config.enabled || !editor) {
      this.statusBar.hide();
      return;
    }

    // 原稿ファイルでない場合
    if (!this.isManuscriptFile(editor.document)) {
      this.statusBar.hide();
      return;
    }

    // 現在のファイルの文字数をカウント
    const content = editor.document.getText();
    const currentCount = this.parser.countWords(content);

    // 同じディレクトリの合計文字数を取得
    const directoryTotal = await this.getDirectoryTotalCount(editor.document.uri);

    // ステータスバーに表示
    if (config.showInStatusBar) {
      this.statusBar.update(currentCount, directoryTotal, config.targetWords);
    } else {
      this.statusBar.hide();
    }
  }

  /**
   * 現在のファイルと同じディレクトリ内の全ファイルの合計文字数を取得
   */
  private async getDirectoryTotalCount(currentFileUri: vscode.Uri): Promise<number> {
    try {
      // 現在のファイルのディレクトリパスを取得
      const currentDir = vscode.Uri.joinPath(currentFileUri, '..');

      // 同じディレクトリ内のmarkdownファイルを検索
      const pattern = new vscode.RelativePattern(currentDir, '*.md');
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
      // eslint-disable-next-line no-undef
      console.error('Error calculating directory total:', error);
      return 0;
    }
  }

  /**
   * デバッグモードで文字数をカウント
   */
  debugCount(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('アクティブなエディタがありません');
      return;
    }

    const content = editor.document.getText();
    this.parser.debug(content);
    
    const count = this.parser.countWords(content);
    vscode.window.showInformationMessage(`文字数: ${count.toLocaleString('ja-JP')}字`);
  }

  /**
   * リソースを解放
   */
  dispose(): void {
    this.disposable.dispose();
    this.statusBar.dispose();
  }
}
