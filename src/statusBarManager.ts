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
    this.statusBarItem.command = 'nokto.countWords';
  }

  /**
   * 文字数を更新して表示
   * @param currentCount 現在のファイルの文字数
   * @param draftTotal draftディレクトリの合計文字数
   * @param target 目標文字数（オプション）
   */
  update(currentCount: number, draftTotal: number, target?: number): void {
    const currentStr = currentCount.toLocaleString('ja-JP');
    const draftStr = draftTotal.toLocaleString('ja-JP');
    
    if (target && target > 0) {
      const targetStr = target.toLocaleString('ja-JP');
      const percentage = draftTotal > 0 ? Math.round((draftTotal / target) * 100) : 0;
      
      if (draftTotal > 0) {
        this.statusBarItem.text = `$(edit) ${currentStr}字 | ${draftStr}字 / ${targetStr}字 (${percentage}%)`;
      } else {
        this.statusBarItem.text = `$(edit) ${currentStr}字 / ${targetStr}字`;
      }
      
      // 目標達成時は色を変更
      if (draftTotal >= target) {
        this.statusBarItem.backgroundColor = new vscode.ThemeColor(
          'statusBarItem.warningBackground'
        );
      } else {
        this.statusBarItem.backgroundColor = undefined;
      }
    } else {
      if (draftTotal > 0) {
        this.statusBarItem.text = `$(edit) ${currentStr}字 | ${draftStr}字`;
      } else {
        this.statusBarItem.text = `$(edit) ${currentStr}字`;
      }
      this.statusBarItem.backgroundColor = undefined;
    }
    
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
