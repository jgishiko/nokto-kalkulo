/**
 * ManuscriptParser - ノクターンノベルズ原稿の文字数カウント
 * 
 * カウント規則:
 * - 文字要素のみカウント：
 *   - ひらがな
 *   - カタカナ
 *   - 漢字
 *   - アルファベット（全角・半角）
 *   - 数字（全角・半角）
 * - 記号、句読点、空白は除外
 * - 全角半角を問わず1文字としてカウント
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

    // 2. 文字要素のみを抽出してカウント
    return this.countCharacters(text);
  }

  /**
   * 文字要素のみをカウント
   * ひらがな、カタカナ、漢字、アルファベット、数字のみ
   */
  private countCharacters(text: string): number {
    // 文字要素のみにマッチする正規表現
    const characterRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFFa-zA-Z0-9\uFF21-\uFF3A\uFF41-\uFF5A\uFF10-\uFF19]/g;
    const matches = text.match(characterRegex);
    return matches ? matches.length : 0;
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
   * デバッグ用：各ステップの結果を出力
   */
  debug(content: string): void {
    /* eslint-disable no-undef */
    console.log('=== ManuscriptParser Debug ===');
    console.log('1. Original:', content.substring(0, 100));

    const step1 = this.removeMarkdownElements(content);
    console.log('2. After removeMarkdown:', step1.substring(0, 100));

    const count = this.countCharacters(step1);
    console.log('3. Character count:', count);
    
    // 抽出された文字の一部を表示
    const characterRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFFa-zA-Z0-9\uFF21-\uFF3A\uFF41-\uFF5A\uFF10-\uFF19]/g;
    const chars = step1.match(characterRegex) || [];
    console.log('4. Extracted characters (first 50):', chars.slice(0, 50).join(''));
    
    console.log('Final count:', count);
    console.log('==============================');
    /* eslint-enable no-undef */
  }
}
