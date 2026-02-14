import * as vscode from 'vscode';
import { ManuscriptParser, WordCountResult } from './manuscriptParser';
import { StatusBarManager } from './statusBarManager';

/**
 * WordCountController - 文字数カウントのメインコントローラー
 */
export class WordCountController {
  private parser: ManuscriptParser;
  private statusBar: StatusBarManager;
  private disposable: vscode.Disposable;
  // 現在のカウント結果をキャッシュ（ポップアップ表示用）
  private currentFileResult: WordCountResult | null = null;
  private directoryResult: WordCountResult | null = null;
  // 出力チャネル
  private outputChannel: vscode.OutputChannel;

  constructor() {
    this.parser = new ManuscriptParser();
    this.statusBar = new StatusBarManager();
    this.outputChannel = vscode.window.createOutputChannel('NoktoKalkulo');
    
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
    const baseConfig: {
      enabled: boolean;
      minWords?: number;
      targetWords: number;
      showInStatusBar: boolean;
      showBackgroundColor: boolean;
    } = {
      enabled: config.get<boolean>('enabled', true),
      minWords: undefined, // デフォルトは undefined（背景色制御のみに使用）
      targetWords: config.get<number>('targetWords', 5000),
      showInStatusBar: config.get<boolean>('showInStatusBar', true),
      showBackgroundColor: config.get<boolean>('showBackgroundColor', false),
    };

    // ディレクトリ固有の設定を読み込む
    if (fileUri) {
      const directoryConfig = await this.loadDirectoryConfig(fileUri);
      if (directoryConfig) {
        // enabled設定が.nokto.jsonにあれば優先
        if (directoryConfig.enabled !== undefined) {
          baseConfig.enabled = directoryConfig.enabled;
        }
        // minWords設定が.nokto.jsonにあれば設定（背景色制御に使用）
        if (directoryConfig.minWords !== undefined) {
          baseConfig.minWords = directoryConfig.minWords;
        }
        // targetWords設定が.nokto.jsonにあれば優先
        if (directoryConfig.targetWords !== undefined) {
          baseConfig.targetWords = directoryConfig.targetWords;
        }
        // showBackgroundColor設定が.nokto.jsonにあれば優先
        if (directoryConfig.showBackgroundColor !== undefined) {
          baseConfig.showBackgroundColor = directoryConfig.showBackgroundColor;
        }
      }
    }

    return baseConfig;
  }

  /**
   * ディレクトリ固有の設定ファイル（.nokto.json）を読み込む
   */
  private async loadDirectoryConfig(fileUri: vscode.Uri): Promise<{ enabled?: boolean; minWords?: number; targetWords?: number; showBackgroundColor?: boolean } | null> {
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
      this.currentFileResult = null;
      this.directoryResult = null;
      return;
    }

    // 原稿ファイルでない場合
    if (!this.isManuscriptFile(editor.document)) {
      this.statusBar.hide();
      this.currentFileResult = null;
      this.directoryResult = null;
      return;
    }

    // 現在のファイルの文字数をカウント（詳細版）
    const content = editor.document.getText();
    this.currentFileResult = this.parser.countWordsDetailed(content);

    // 同じディレクトリの合計文字数を取得
    const directoryUri = vscode.Uri.joinPath(editor.document.uri, '..');
    this.directoryResult = await this.countFilesInDirectoryDetailed(directoryUri);

    // ステータスバーに表示
    if (config.showInStatusBar) {
      const currentCount = this.currentFileResult.total;
      const directoryTotal = this.directoryResult.total;
      this.statusBar.update(currentCount, directoryTotal, config.minWords, config.targetWords, config.showBackgroundColor);
    } else {
      this.statusBar.hide();
    }
  }

  /**
   * 指定したディレクトリ（配下のサブディレクトリを含む）内の全ファイルの合計文字数を取得
   */
  private async countFilesInDirectory(directoryUri: vscode.Uri): Promise<number> {
    const result = await this.countFilesInDirectoryDetailed(directoryUri);
    return result.total;
  }

  /**
   * 指定したディレクトリ（配下のサブディレクトリを含む）内の全ファイルの詳細な文字数を取得
   */
  private async countFilesInDirectoryDetailed(directoryUri: vscode.Uri): Promise<WordCountResult> {
    try {
      // ディレクトリ配下のすべてのmarkdownファイルを検索（サブディレクトリも含む）
      const pattern = new vscode.RelativePattern(directoryUri, '**/*.md');
      const files = await vscode.workspace.findFiles(pattern);

      // 各ファイルの文字数を合計
      let totalCount = 0;
      let dialogueCount = 0;
      let narrationCount = 0;

      for (const fileUri of files) {
        const doc = await vscode.workspace.openTextDocument(fileUri);
        const content = doc.getText();
        const result = this.parser.countWordsDetailed(content);
        totalCount += result.total;
        dialogueCount += result.dialogue;
        narrationCount += result.narration;
      }

      return {
        total: totalCount,
        dialogue: dialogueCount,
        narration: narrationCount
      };
    } catch (error) {
      // eslint-disable-next-line no-undef
      console.error('Error calculating directory total:', error);
      return { total: 0, dialogue: 0, narration: 0 };
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
   * 詳細な文字数情報をポップアップで表示
   */
  showDetailedCount(): void {
    if (!this.currentFileResult || !this.directoryResult) {
      vscode.window.showWarningMessage('文字数情報がありません');
      return;
    }

    // 現在のファイルの情報
    const fileTotal = this.currentFileResult.total.toLocaleString('ja-JP');
    const fileDialogue = this.currentFileResult.dialogue.toLocaleString('ja-JP');
    const fileNarration = this.currentFileResult.narration.toLocaleString('ja-JP');
    const fileDialoguePercent = this.currentFileResult.total > 0 
      ? ((this.currentFileResult.dialogue / this.currentFileResult.total) * 100).toFixed(1)
      : '0.0';
    const fileNarrationPercent = this.currentFileResult.total > 0 
      ? ((this.currentFileResult.narration / this.currentFileResult.total) * 100).toFixed(1)
      : '0.0';

    // ディレクトリ全体の情報
    const dirTotal = this.directoryResult.total.toLocaleString('ja-JP');
    const dirDialogue = this.directoryResult.dialogue.toLocaleString('ja-JP');
    const dirNarration = this.directoryResult.narration.toLocaleString('ja-JP');
    const dirDialoguePercent = this.directoryResult.total > 0 
      ? ((this.directoryResult.dialogue / this.directoryResult.total) * 100).toFixed(1)
      : '0.0';
    const dirNarrationPercent = this.directoryResult.total > 0 
      ? ((this.directoryResult.narration / this.directoryResult.total) * 100).toFixed(1)
      : '0.0';

    // OutputChannelをクリアして情報を表示
    this.outputChannel.clear();
    this.outputChannel.appendLine('📊 文字数詳細情報');
    this.outputChannel.appendLine('');
    this.outputChannel.appendLine('【現在のファイル】');
    this.outputChannel.appendLine(`総文字数: ${fileTotal}字`);
    this.outputChannel.appendLine(`├ セリフ: ${fileDialogue}字 (${fileDialoguePercent}%)`);
    this.outputChannel.appendLine(`└ 地の文: ${fileNarration}字 (${fileNarrationPercent}%)`);

    // ディレクトリ全体の情報が異なる場合のみ表示
    if (this.directoryResult.total !== this.currentFileResult.total) {
      this.outputChannel.appendLine('');
      this.outputChannel.appendLine('【ディレクトリ全体】');
      this.outputChannel.appendLine(`総文字数: ${dirTotal}字`);
      this.outputChannel.appendLine(`├ セリフ: ${dirDialogue}字 (${dirDialoguePercent}%)`);
      this.outputChannel.appendLine(`└ 地の文: ${dirNarration}字 (${dirNarrationPercent}%)`);
    }

    // 出力パネルを表示
    this.outputChannel.show();
  }

  /**
   * リソースを解放
   */
  dispose(): void {
    this.disposable.dispose();
    this.statusBar.dispose();
    this.outputChannel.dispose();
  }
}
