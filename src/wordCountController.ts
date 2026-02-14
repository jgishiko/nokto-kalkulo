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
  // 詳細情報の自動表示フラグ（一度表示したら以降は自動更新する）
  private autoShowDetailedInfo: boolean = false;

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
  private async onDidChangeActiveTextEditor(): Promise<void> {
    await this.updateWordCount();
    // 一度詳細情報を表示したら、以降は自動更新する
    if (this.autoShowDetailedInfo && this.currentFileResult && this.directoryResult) {
      await this.showDetailedCount(true);
    }
  }

  /**
   * ドキュメント変更時のハンドラ
   */
  private async onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent): Promise<void> {
    if (this.isManuscriptFile(e.document)) {
      await this.updateWordCount();
      // 一度詳細情報を表示したら、以降は自動更新する
      if (this.autoShowDetailedInfo && this.currentFileResult && this.directoryResult) {
        await this.showDetailedCount(true);
      }
    }
  }

  /**
   * 設定変更時のハンドラ
   */
  private async onDidChangeConfiguration(e: vscode.ConfigurationChangeEvent): Promise<void> {
    if (e.affectsConfiguration('nokto.wordCount')) {
      await this.updateWordCount();
      // 一度詳細情報を表示したら、以降は自動更新する
      if (this.autoShowDetailedInfo && this.currentFileResult && this.directoryResult) {
        await this.showDetailedCount(true);
      }
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
      targetWords: number;
      showInStatusBar: boolean;
    } = {
      targetWords: config.get<number>('targetWords', 0),
      showInStatusBar: config.get<boolean>('showInStatusBar', true),
    };

    // ディレクトリ固有の設定を読み込む
    if (fileUri) {
      const directoryConfig = await this.loadDirectoryConfig(fileUri);
      if (directoryConfig) {
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
  private async loadDirectoryConfig(fileUri: vscode.Uri): Promise<{ targetWords?: number } | null> {
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

    // エディタがない場合
    if (!editor) {
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
    const currentFileResult = this.parser.countWordsDetailed(content);

    // 同じディレクトリの合計文字数を取得
    const directoryUri = vscode.Uri.joinPath(editor.document.uri, '..');
    const directoryResult = await this.countFilesInDirectoryDetailed(directoryUri);

    this.currentFileResult = currentFileResult;
    this.directoryResult = directoryResult;

    // ステータスバーに表示
    if (config.showInStatusBar) {
      const currentCount = currentFileResult.total;
      const directoryTotal = directoryResult.total;
      this.statusBar.update(currentCount, directoryTotal, config.targetWords);
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
   * @param autoUpdate 自動更新モードかどうか
   */
  async showDetailedCount(autoUpdate: boolean = false): Promise<void> {
    if (!this.currentFileResult || !this.directoryResult) {
      // 自動更新の場合はエラーメッセージを出さずに終了
      if (!autoUpdate) {
        vscode.window.showWarningMessage('文字数情報がありません');
      }
      return;
    }

    // フラグを立てて以降は自動更新する
    this.autoShowDetailedInfo = true;

    // 設定を取得
    const editor = vscode.window.activeTextEditor;
    const config = await this.getConfiguration(editor?.document.uri);
    const targetWords = config.targetWords;

    // 現在のファイルの情報
    const fileTotal = this.currentFileResult.total.toLocaleString('ja-JP');
    const fileDialogue = this.currentFileResult.dialogue.toLocaleString('ja-JP');
    const fileNarration = this.currentFileResult.narration.toLocaleString('ja-JP');
    const fileDialoguePercent = this.currentFileResult.total > 0 
      ? Math.round((this.currentFileResult.dialogue / this.currentFileResult.total) * 100)
      : 0;
    const fileNarrationPercent = this.currentFileResult.total > 0 
      ? Math.round((this.currentFileResult.narration / this.currentFileResult.total) * 100)
      : 0;

    // ディレクトリ全体の情報
    const dirTotal = this.directoryResult.total.toLocaleString('ja-JP');
    const dirDialogue = this.directoryResult.dialogue.toLocaleString('ja-JP');
    const dirNarration = this.directoryResult.narration.toLocaleString('ja-JP');
    const dirDialoguePercent = this.directoryResult.total > 0 
      ? Math.round((this.directoryResult.dialogue / this.directoryResult.total) * 100)
      : 0;
    const dirNarrationPercent = this.directoryResult.total > 0 
      ? Math.round((this.directoryResult.narration / this.directoryResult.total) * 100)
      : 0;

    // OutputChannelをクリアして情報を表示
    this.outputChannel.clear();
    this.outputChannel.appendLine('NoktoKalkulo');
    this.outputChannel.appendLine('');
    this.outputChannel.appendLine('=== 現在のファイル ===');
    this.outputChannel.appendLine('');
    this.outputChannel.appendLine(`総文字数: ${fileTotal}字`);
    this.outputChannel.appendLine('');
    this.outputChannel.appendLine(`セリフ: ${fileDialogue}字 (${fileDialoguePercent}%)`);
    this.outputChannel.appendLine(`地の文: ${fileNarration}字 (${fileNarrationPercent}%)`);
    this.outputChannel.appendLine('');
    this.outputChannel.appendLine('----------------------------------------');
    this.outputChannel.appendLine('');
    this.outputChannel.appendLine('=== ディレクトリ合計 ===');
    this.outputChannel.appendLine('');
    
    // 目標文字数が設定されている場合のみ進捗情報を表示
    if (targetWords > 0) {
      const targetStr = targetWords.toLocaleString('ja-JP');
      const progressPercent = Math.round((this.directoryResult.total / targetWords) * 100);
      const remaining = Math.max(0, targetWords - this.directoryResult.total);
      const remainingStr = remaining.toLocaleString('ja-JP');
      
      this.outputChannel.appendLine(`総文字数: ${dirTotal}字 / ${targetStr}字`);
      this.outputChannel.appendLine('');
      this.outputChannel.appendLine(`進捗: ${progressPercent}%`);
      this.outputChannel.appendLine(`残り: ${remainingStr}字`);
    } else {
      this.outputChannel.appendLine(`総文字数: ${dirTotal}字`);
    }
    
    this.outputChannel.appendLine('');
    this.outputChannel.appendLine(`セリフ: ${dirDialogue}字 (${dirDialoguePercent}%)`);
    this.outputChannel.appendLine(`地の文: ${dirNarration}字 (${dirNarrationPercent}%)`);

    // 出力パネルを表示（フォーカスはエディタに保持）
    this.outputChannel.show(true);
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
