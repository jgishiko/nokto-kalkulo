import * as vscode from 'vscode';

/**
 * StatusBarManager - ステータスバーでの文字数表示を管理
 */
export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    // クリック時に詳細情報を表示するコマンドに変更
    this.statusBarItem.command = 'nokto.showDetailedCount';
  }

  /**
   * 文字数を更新して表示
   * @param currentCount 現在のファイルの文字数
   * @param draftTotal draftディレクトリの合計文字数
   * @param target 目標文字数（オプション）
   */
  update(currentCount: number, draftTotal: number, target?: number): void {
    const currentStr = currentCount.toLocaleString('ja-JP');
    
    // 表示テキストを構築: ファイル内文字総数 | ディレクトリ内進捗率
    let displayText = `${currentStr}字`;
    
    if (target && target > 0) {
      // 達成率はディレクトリ合計がある場合はそれを使用、なければ現在のファイルを使用
      const countForPercentage = draftTotal > 0 ? draftTotal : currentCount;
      const percentage = Math.round((countForPercentage / target) * 100);
      displayText += ` | ${percentage}%`;
    }
    
    this.statusBarItem.text = displayText;
    this.statusBarItem.show();
  }

  /**
   * ステータスバーを非表示
   */
  hide(): void {
    this.statusBarItem.hide();
  }

  /**
   * リソースを解放
   */
  dispose(): void {
    this.statusBarItem.dispose();
  }
}
