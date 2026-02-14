import * as assert from 'assert';
import { ManuscriptParser } from '../../src/manuscriptParser';

suite('ManuscriptParser Test Suite', () => {
  let parser: ManuscriptParser;

  setup(() => {
    parser = new ManuscriptParser();
  });

  test('空文字列は0文字', () => {
    assert.strictEqual(parser.countWords(''), 0);
  });

  test('通常の文章（記号は除外）', () => {
    const text = '吾輩は猫である。名前はまだ無い。';
    const count = parser.countWords(text);
    // ひらがな・漢字のみカウント、句点は除外：吾輩は猫である名前はまだ無い = 15文字
    assert.strictEqual(count, 15);
  });

  test('会話文の記号は除外、内容はカウント', () => {
    const text = '太郎は「こんにちは」と言った。';
    const count = parser.countWords(text);
    // 太郎はこんにちはと言った = 11文字（「」。は除外）
    assert.strictEqual(count, 11);
  });

  test('三点リーダーは除外', () => {
    const text = '彼は黙って考えた…';
    const count = parser.countWords(text);
    // 彼は黙って考えた = 8文字（…は除外）
    assert.strictEqual(count, 8);
  });

  test('ダッシュは除外', () => {
    const text = '彼は―そう、彼は決意した。';
    const count = parser.countWords(text);
    // 彼はそう彼は決意した = 10文字（―、。は除外）
    assert.strictEqual(count, 10);
  });

  test('改行と空白は除外', () => {
    const text = `吾輩は猫である。

名前はまだ無い。`;
    const count = parser.countWords(text);
    // 吾輩は猫である名前はまだ無い = 15文字
    assert.strictEqual(count, 15);
  });

  test('アルファベット（半角）はカウント', () => {
    const text = 'これはTestです。';
    const count = parser.countWords(text);
    // これはTestです = 8文字
    assert.strictEqual(count, 8);
  });

  test('アルファベット（全角）はカウント', () => {
    const text = 'これはＴｅｓｔです。';
    const count = parser.countWords(text);
    // これはＬｅｓｔです = 8文字
    assert.strictEqual(count, 8);
  });

  test('数字（半角）はカウント', () => {
    const text = '第123章です。';
    const count = parser.countWords(text);
    // 第123章です = 6文字
    assert.strictEqual(count, 6);
  });

  test('数字（全角）はカウント', () => {
    const text = '第１２３章です。';
    const count = parser.countWords(text);
    // 第１２３章です = 6文字
    assert.strictEqual(count, 6);
  });

  test('Markdownの見出しは除外', () => {
    const text = '## 第一章\n\n物語は始まった。';
    const count = parser.countWords(text);
    // "物語は始まった" = 7文字（見出し行全体を除外、。も除外）
    assert.strictEqual(count, 7);
  });

  test('Markdownの強調は内容のみカウント', () => {
    const text = '彼は**強く**決意した。';
    const count = parser.countWords(text);
    // "彼は強く決意した" = 8文字
    assert.strictEqual(count, 8);
  });

  test('HTMLコメントは除外', () => {
    const text = '物語が<!-- TODO: あとで書く -->始まった。';
    const count = parser.countWords(text);
    // "物語が始まった" = 6文字
    assert.strictEqual(count, 6);
  });

  test('HTMLタグは除外', () => {
    const text = '彼は<strong>強く</strong>決意した。';
    const count = parser.countWords(text);
    // "彼は強く決意した" = 8文字
    assert.strictEqual(count, 8);
  });

  test('自己閉じHTMLタグは除外', () => {
    const text = '物語が<br />始まった。';
    const count = parser.countWords(text);
    // "物語が始まった" = 7文字
    assert.strictEqual(count, 7);
  });

  test('Markdown引用行は除外', () => {
    const text = '> これは引用です。\n\n通常の文章です。';
    const count = parser.countWords(text);
    // "通常の文章です" = 7文字
    assert.strictEqual(count, 7);
  });

  test('ネストした引用行も除外', () => {
    const text = '> 引用レベル1\n>> 引用レベル2\n\n本文です。';
    const count = parser.countWords(text);
    // "本文です" = 4文字
    assert.strictEqual(count, 4);
  });

  test('カタカナもカウント', () => {
    const text = 'これはテストです。';
    const count = parser.countWords(text);
    // これはテストです = 8文字
    assert.strictEqual(count, 8);
  });

  test('複合的なテスト', () => {
    const text = `## 第一章

太郎は「やあ、元気かい？」と声をかけた。
彼女は少し困った顔をして…答えた。

「ええ、まあね」

物語は―こうして始まったのだ。`;

    const count = parser.countWords(text);
    // 第一章 + 太郎はやあ元気かいと声をかけた + 彼女は少し困った顔をして答えた + ええまあね + 物語はこうして始まったのだ
    // = 3 + 15 + 14 + 4 + 13 = 49文字
    assert.strictEqual(count, 49);
  });

  // 詳細カウント（地の文とセリフの分離）テスト
  test('セリフと地の文の分離：基本', () => {
    const text = '太郎は「こんにちは」と言った。';
    const result = parser.countWordsDetailed(text);
    // 総文字数: 太郎はこんにちはと言った = 11文字
    // セリフ: こんにちは = 5文字
    // 地の文: 太郎はと言った = 6文字
    assert.strictEqual(result.total, 11);
    assert.strictEqual(result.dialogue, 5);
    assert.strictEqual(result.narration, 6);
  });

  test('セリフと地の文の分離：複数のセリフ', () => {
    const text = '太郎は「やあ」と声をかけた。花子は「こんにちは」と答えた。';
    const result = parser.countWordsDetailed(text);
    // 総文字数: 太郎はやあと声をかけた花子はこんにちはと答えた = 22文字
    // セリフ: やあ + こんにちは = 2 + 5 = 7文字
    // 地の文: 太郎はと声をかけた花子はと答えた = 15文字
    assert.strictEqual(result.total, 22);
    assert.strictEqual(result.dialogue, 7);
    assert.strictEqual(result.narration, 15);
  });

  test('セリフと地の文の分離：セリフのみ', () => {
    const text = '「こんにちは、元気ですか？」';
    const result = parser.countWordsDetailed(text);
    // 総文字数: こんにちは元気ですか = 10文字
    // セリフ: こんにちは元気ですか = 10文字
    // 地の文: 0文字
    assert.strictEqual(result.total, 10);
    assert.strictEqual(result.dialogue, 10);
    assert.strictEqual(result.narration, 0);
  });

  test('セリフと地の文の分離：地の文のみ', () => {
    const text = '太郎は静かに歩いていった。';
    const result = parser.countWordsDetailed(text);
    // 総文字数: 太郎は静かに歩いていった = 12文字
    // セリフ: 0文字
    // 地の文: 太郎は静かに歩いていった = 12文字
    assert.strictEqual(result.total, 12);
    assert.strictEqual(result.dialogue, 0);
    assert.strictEqual(result.narration, 12);
  });

  test('セリフと地の文の分離：二重かぎ括弧', () => {
    const text = '彼は『古事記』を読んでいた。';
    const result = parser.countWordsDetailed(text);
    // 総文字数: 彼は古事記を読んでいた = 11文字
    // セリフ: 古事記 = 3文字（『』内もセリフとして扱う）
    // 地の文: 彼はを読んでいた = 8文字
    assert.strictEqual(result.total, 11);
    assert.strictEqual(result.dialogue, 3);
    assert.strictEqual(result.narration, 8);
  });

  test('セリフと地の文の分離：空文字列', () => {
    const result = parser.countWordsDetailed('');
    assert.strictEqual(result.total, 0);
    assert.strictEqual(result.dialogue, 0);
    assert.strictEqual(result.narration, 0);
  });
