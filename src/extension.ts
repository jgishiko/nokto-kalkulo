import * as vscode from 'vscode';
import { WordCountController } from './wordCountController';

let controller: WordCountController | undefined;

/**
 * 拡張機能の有効化
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('NoktoKalkulo が起動しました');

  // コントローラーを初期化
  controller = new WordCountController();
  context.subscriptions.push(controller);

  // コマンド登録: 文字数カウント
  const countCommand = vscode.commands.registerCommand(
    'nokto.countWords',
    () => {
      if (controller) {
        controller.updateWordCount();
        vscode.window.showInformationMessage('文字数をカウントしました');
      }
    }
  );
  context.subscriptions.push(countCommand);

  // コマンド登録: デバッグカウント
  const debugCommand = vscode.commands.registerCommand(
    'nokto.debugCount',
    () => {
      if (controller) {
        controller.debugCount();
      }
    }
  );
  context.subscriptions.push(debugCommand);
}

/**
 * 拡張機能の無効化
 */
export function deactivate() {
  if (controller) {
    controller.dispose();
    controller = undefined;
  }
}
