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
   * @param minWords 最小文字数（背景色制御用、表示には使用しない）
   * @param target 目標文字数（オプション）
   * @param showBackgroundColor 背景色を表示するかどうか（デフォルト: false）
   */
  update(currentCount: number, draftTotal: number, minWords?: number, target?: number, showBackgroundColor: boolean = false): void {
    const currentStr = currentCount.toLocaleString('ja-JP');
    const draftStr = draftTotal.toLocaleString('ja-JP');
    
    // 表示テキストを構築: 現在のファイル | ディレクトリ合計 / 目標文字数 (達成率)
    let displayText = `$(edit) `;
    
    if (draftTotal > 0 && draftTotal !== currentCount) {
      // ディレクトリに複数ファイルがある場合
      displayText += `${currentStr}字 | ${draftStr}字`;
    } else {
      // 現在のファイルのみの場合
      displayText += `${currentStr}字`;
    }
    
    if (target && target > 0) {
      const targetStr = target.toLocaleString('ja-JP');
      // 達成率はディレクトリ合計がある場合はそれを使用、なければ現在のファイルを使用
      const countForPercentage = draftTotal > 0 ? draftTotal : currentCount;
      const percentage = Math.round((countForPercentage / target) * 100);
      displayText += ` / ${targetStr}字 (${percentage}%)`;
    }
    
    this.statusBarItem.text = displayText;
    
    // 背景色の設定
    if (showBackgroundColor) {
      if (minWords !== undefined && minWords > 0 && target !== undefined && target > 0) {
        if (draftTotal <= minWords) {
          // 入力文字数が最小文字数以下のとき：赤
          this.statusBarItem.backgroundColor = new vscode.ThemeColor(
            'statusBarItem.errorBackground'
          );
        } else if (draftTotal >= target) {
          // 入力文字数が最大文字数以上のとき：緑
          this.statusBarItem.backgroundColor = new vscode.ThemeColor(
            'statusBarItem.warningBackground'
          );
        } else {
          // 最小文字数＜入力文字数＜最大文字数のとき：デフォルト
          this.statusBarItem.backgroundColor = undefined;
        }
      } else if (target && target > 0 && draftTotal >= target) {
        // 最小文字数の設定がない場合は従来通り
        this.statusBarItem.backgroundColor = new vscode.ThemeColor(
          'statusBarItem.warningBackground'
        );
      } else {
        this.statusBarItem.backgroundColor = undefined;
      }
    } else {
      // 背景色を表示しない設定の場合
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
