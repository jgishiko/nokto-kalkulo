/**
 * ManuscriptParser - ノクターンノベルズ原稿の文字数カウント
 * 
 * カウント規則:
 * - 会話文（「」内）: 閉じカッコまでで1文字
 * - 三点リーダー（…）: 2文字
 * - ダッシュ（―）: 1文字
 * - 改行・空白: 除外
 * - 引用行（> で始まる行）: 除外
 * - HTMLタグ: 除外
 */
export class ManuscriptParser {
  /**
   * 原稿の文字数をカウント
   * @param content 原稿テキスト
   * @returns 文字数
   */
  countWords(content: string): number {
    if (!content) {
      return 0;
    }

    // 1. Markdownのメタデータ、コメント、コードブロックを除外
    let text = this.removeMarkdownElements(content);

    // 2. 会話文を1文字に置き換え
    text = this.normalizeDialogue(text);

    // 3. 特殊文字を正規化
    text = this.normalizeSpecialCharacters(text);

    // 4. 改行と空白を除外
    text = text.replace(/\s+/g, '');

    // 5. 文字数をカウント
    return text.length;
  }

  /**
   * Markdownの要素を除外
   */
  private removeMarkdownElements(content: string): string {
    // HTMLコメント除外
    let text = content.replace(/<!--[\s\S]*?-->/g, '');

    // HTMLタグ除外
    text = text.replace(/<[^>]*>/g, '');

    // コードブロック除外
    text = text.replace(/```[\s\S]*?```/g, '');

    // インラインコード除外
    text = text.replace(/`[^`]+`/g, '');

    // 引用行全体を除外（> で始まる行）
    text = text.replace(/^>+\s*.*$/gm, '');

    // 見出し行全体を除外（メタデータとして扱う）
    text = text.replace(/^#+\s+.*$/gm, '');

    // リスト記号除外
    text = text.replace(/^[*\-+]\s+/gm, '');
    text = text.replace(/^\d+\.\s+/gm, '');

    // 強調記号除外（内容は残す）
    text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
    text = text.replace(/\*([^*]+)\*/g, '$1');
    text = text.replace(/__([^_]+)__/g, '$1');
    text = text.replace(/_([^_]+)_/g, '$1');

    // リンク除外（テキスト部分は残す）
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    return text;
  }

  /**
   * 会話文を正規化（「」内を1文字に）
   */
  private normalizeDialogue(text: string): string {
    // 「...」を 'D' (Dialogue) 1文字に置き換え
    return text.replace(/「[^」]*」/g, 'D');
  }

  /**
   * 特殊文字を正規化
   */
  private normalizeSpecialCharacters(text: string): string {
    // 三点リーダー（…）→ 2文字（'EE'で表現）
    text = text.replace(/…/g, 'EE');

    // ダッシュ（―）→ 1文字（そのまま）
    // すでに1文字なので変換不要

    return text;
  }

  /**
   * デバッグ用：各ステップの結果を出力
   */
  debug(content: string): void {
    /* eslint-disable no-undef */
    console.log('=== ManuscriptParser Debug ===');
    console.log('1. Original:', content.substring(0, 100));

    const step1 = this.removeMarkdownElements(content);
    console.log('2. After removeMarkdown:', step1.substring(0, 100));

    const step2 = this.normalizeDialogue(step1);
    console.log('3. After normalizeDialogue:', step2.substring(0, 100));

    const step3 = this.normalizeSpecialCharacters(step2);
    console.log('4. After normalizeSpecial:', step3.substring(0, 100));

    const step4 = step3.replace(/\s+/g, '');
    console.log('5. After removeWhitespace:', step4.substring(0, 100));

    console.log('Final count:', step4.length);
    console.log('==============================');
    /* eslint-enable no-undef */
  }
}
