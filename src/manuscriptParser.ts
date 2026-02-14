/**
 * CJK文字種の詳細カウント（将来的な統計表示用）
 */
export interface CJKDetails {
  /** ひらがな */
  hiragana: number;
  /** カタカナ */
  katakana: number;
  /** 日本の漢字 */
  kanji: number;
  /** 中国語繁体字 */
  traditionalChinese: number;
  /** 中国語簡体字 */
  simplifiedChinese: number;
  /** ハングル */
  korean: number;
  /** アルファベット・数字 */
  alphanumeric: number;
}

/**
 * 文字数カウントの結果
 */
export interface WordCountResult {
  /** 総文字数 */
  total: number;
  /** セリフの文字数 */
  dialogue: number;
  /** 地の文の文字数 */
  narration: number;
  /** CJK文字種の詳細（内部用、将来の統計表示に使用） */
  cjkDetails?: CJKDetails;
}

/**
 * ManuscriptParser - ノクターンノベルズ原稿の文字数カウント
 * 
 * カウント規則:
 * - 文字要素のみカウント：
 *   - ひらがな
 *   - カタカナ
 *   - 漢字（日本、中国繁体字、簡体字）
 *   - ハングル
 *   - アルファベット（全角・半角）
 *   - 数字（全角・半角）
 * - 記号、句読点、空白は除外
 * - 全角半角を問わず1文字としてカウント
 * - CJK文字種は内部でカウントされ、将来的に統計情報として表示可能
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
   * 原稿の詳細な文字数をカウント（地の文とセリフを分離）
   * @param content 原稿テキスト
   * @returns 詳細な文字数情報（CJK文字種の詳細を含む）
   */
  countWordsDetailed(content: string): WordCountResult {
    if (!content) {
      return { 
        total: 0, 
        dialogue: 0, 
        narration: 0,
        cjkDetails: {
          hiragana: 0,
          katakana: 0,
          kanji: 0,
          traditionalChinese: 0,
          simplifiedChinese: 0,
          korean: 0,
          alphanumeric: 0
        }
      };
    }

    // 1. Markdownのメタデータ、コメント、コードブロックを除外
    let text = this.removeMarkdownElements(content);

    // 2. CJK詳細情報を取得
    const cjkDetails = this.countCharactersDetailed(text);

    // 3. セリフと地の文を分離してカウント
    const dialogueCount = this.countDialogue(text);
    const totalCount = this.countCharacters(text);
    const narrationCount = totalCount - dialogueCount;

    return {
      total: totalCount,
      dialogue: dialogueCount,
      narration: narrationCount,
      cjkDetails: cjkDetails
    };
  }

  /**
   * セリフ（かぎ括弧内のテキスト）の文字数をカウント
   * 日本語：「」『』
   * 中国語：""''
   * 韓国語：""''（中国語と同様）
   * @param text テキスト
   * @returns セリフの文字数
   */
  private countDialogue(text: string): number {
    // 日本語のかぎ括弧「」と二重かぎ括弧『』
    // 中国語・韓国語の引用符 ""''
    const dialogueRegex = /[「『""]([^」』""]*)[」』""]/g;
    let matches;
    let dialogueText = '';
    
    while ((matches = dialogueRegex.exec(text)) !== null) {
      dialogueText += matches[1];
    }

    return this.countCharacters(dialogueText);
  }

  /**
   * 文字要素のみをカウント
   * ひらがな、カタカナ、漢字、ハングル、アルファベット、数字のみ
   * CJK文字種ごとに分類してカウント（内部用）
   */
  private countCharacters(text: string): number {
    // 文字要素のみにマッチする正規表現（CJK全体を含む）
    const characterRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF\u1100-\u11FFa-zA-Z0-9\uFF21-\uFF3A\uFF41-\uFF5A\uFF10-\uFF19]/g;
    const matches = text.match(characterRegex);
    return matches ? matches.length : 0;
  }

  /**
   * CJK文字種ごとに詳細にカウント（内部用）
   * @param text テキスト
   * @returns CJK詳細カウント
   */
  private countCharactersDetailed(text: string): CJKDetails {
    const details: CJKDetails = {
      hiragana: 0,
      katakana: 0,
      kanji: 0,
      traditionalChinese: 0,
      simplifiedChinese: 0,
      korean: 0,
      alphanumeric: 0
    };

    for (const char of text) {
      const code = char.charCodeAt(0);

      // ひらがな (U+3040-U+309F)
      if (code >= 0x3040 && code <= 0x309F) {
        details.hiragana++;
      }
      // カタカナ (U+30A0-U+30FF)
      else if (code >= 0x30A0 && code <= 0x30FF) {
        details.katakana++;
      }
      // ハングル音節 (U+AC00-U+D7AF)
      else if (code >= 0xAC00 && code <= 0xD7AF) {
        details.korean++;
      }
      // ハングル字母 (U+1100-U+11FF)
      else if (code >= 0x1100 && code <= 0x11FF) {
        details.korean++;
      }
      // CJK統合漢字 (U+4E00-U+9FFF)
      // 繁体字、簡体字、日本の漢字が混在しているため、
      // コンテキストベースの判定を行う（簡略版）
      else if (code >= 0x4E00 && code <= 0x9FFF) {
        // 周囲の文字から判定（簡略版）
        const context = this.detectCJKContext(text, text.indexOf(char));
        if (context === 'traditional') {
          details.traditionalChinese++;
        } else if (context === 'simplified') {
          details.simplifiedChinese++;
        } else {
          // デフォルトは日本の漢字として扱う
          details.kanji++;
        }
      }
      // アルファベット・数字（全角・半角）
      else if (
        (code >= 0x0030 && code <= 0x0039) || // 半角数字
        (code >= 0x0041 && code <= 0x005A) || // 半角英大文字
        (code >= 0x0061 && code <= 0x007A) || // 半角英小文字
        (code >= 0xFF10 && code <= 0xFF19) || // 全角数字
        (code >= 0xFF21 && code <= 0xFF3A) || // 全角英大文字
        (code >= 0xFF41 && code <= 0xFF5A)    // 全角英小文字
      ) {
        details.alphanumeric++;
      }
    }

    return details;
  }

  /**
   * CJK漢字のコンテキストを検出（簡略版）
   * 周囲の文字（ひらがな、ハングルなど）から言語を推測
   * @param text 全体のテキスト
   * @param index 対象文字のインデックス
   * @returns 'japanese' | 'traditional' | 'simplified' | 'unknown'
   */
  private detectCJKContext(text: string, index: number): 'japanese' | 'traditional' | 'simplified' | 'unknown' {
    // 前後5文字をチェック
    const start = Math.max(0, index - 5);
    const end = Math.min(text.length, index + 6);
    const context = text.substring(start, end);

    // ひらがな・カタカナがあれば日本語
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(context)) {
      return 'japanese';
    }

    // ハングルがあれば韓国語（漢字は使わないが念のため）
    if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(context)) {
      return 'unknown'; // 韓国語では漢字は通常使わない
    }

    // 中国語の引用符があれば中国語
    if (/[""]/.test(context)) {
      // 簡体字固有の文字があれば簡体字
      // （完全な判定は困難なため、簡略的に処理）
      // ここでは区別せず、traditionalとして扱う
      return 'traditional';
    }

    // 判定不能の場合はunknown（日本語として扱われる）
    return 'unknown';
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
    const characterRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF\u1100-\u11FFa-zA-Z0-9\uFF21-\uFF3A\uFF41-\uFF5A\uFF10-\uFF19]/g;
    const chars = step1.match(characterRegex) || [];
    console.log('4. Extracted characters (first 50):', chars.slice(0, 50).join(''));
    
    // 詳細カウント情報
    const detailed = this.countWordsDetailed(content);
    console.log('5. Detailed count:');
    console.log('   Total:', detailed.total);
    console.log('   Dialogue:', detailed.dialogue);
    console.log('   Narration:', detailed.narration);
    
    // CJK詳細情報
    if (detailed.cjkDetails) {
      console.log('6. CJK Details:');
      console.log('   Hiragana:', detailed.cjkDetails.hiragana);
      console.log('   Katakana:', detailed.cjkDetails.katakana);
      console.log('   Kanji (Japanese):', detailed.cjkDetails.kanji);
      console.log('   Traditional Chinese:', detailed.cjkDetails.traditionalChinese);
      console.log('   Simplified Chinese:', detailed.cjkDetails.simplifiedChinese);
      console.log('   Korean:', detailed.cjkDetails.korean);
      console.log('   Alphanumeric:', detailed.cjkDetails.alphanumeric);
    }
    
    console.log('Final count:', count);
    console.log('==============================');
    /* eslint-enable no-undef */
  }
}
