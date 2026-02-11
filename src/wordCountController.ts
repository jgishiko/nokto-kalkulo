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
  private onDidChangeActiveTextEditor(editor?: vscode.TextEditor): void {
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
    // Markdownファイルかつmanuscriptフォルダ内
    return (
      document.languageId === 'markdown' &&
      (document.uri.fsPath.includes('manuscript') ||
       document.uri.fsPath.includes('plot'))
    );
  }

  /**
   * 設定を取得
   */
  private getConfiguration() {
    const config = vscode.workspace.getConfiguration('nokto.wordCount');
    return {
      enabled: config.get<boolean>('enabled', true),
      targetWords: config.get<number>('targetWords', 5000),
      showInStatusBar: config.get<boolean>('showInStatusBar', true),
    };
  }

  /**
   * 文字数を更新
   */
  updateWordCount(): void {
    const editor = vscode.window.activeTextEditor;
    const config = this.getConfiguration();

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

    // 文字数をカウント
    const content = editor.document.getText();
    const count = this.parser.countWords(content);

    // ステータスバーに表示
    if (config.showInStatusBar) {
      this.statusBar.update(count, config.targetWords);
    } else {
      this.statusBar.hide();
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
