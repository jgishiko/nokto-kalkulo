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
   * @param count 現在の文字数
   * @param target 目標文字数（オプション）
   */
  update(count: number, target?: number): void {
    const countStr = count.toLocaleString('ja-JP');
    
    if (target && target > 0) {
      const targetStr = target.toLocaleString('ja-JP');
      const percentage = Math.round((count / target) * 100);
      this.statusBarItem.text = `📝 ${countStr}字 / ${targetStr}字 (${percentage}%)`;
      
      // 目標達成時は色を変更
      if (count >= target) {
        this.statusBarItem.backgroundColor = new vscode.ThemeColor(
          'statusBarItem.warningBackground'
        );
      } else {
        this.statusBarItem.backgroundColor = undefined;
      }
    } else {
      this.statusBarItem.text = `📝 ${countStr}字`;
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
