// 実行: node english-app/checker.test.js
const assert = require('assert');
const { normalize, checkAnswer } = require('./checker');
const { SENTENCES, CATEGORIES } = require('./data');

// 正規化
assert.deepStrictEqual(normalize("I'm fine, thank you."), ['i', 'am', 'fine', 'thank', 'you']);
assert.deepStrictEqual(normalize('I am fine thank you'), ['i', 'am', 'fine', 'thank', 'you']);
assert.deepStrictEqual(normalize('I don’t understand!'), ['i', 'do', 'not', 'understand']);
assert.deepStrictEqual(normalize("twenty-five"), ['twenty', 'five']);

// 大文字小文字・句読点・短縮形の違いは正解扱い
assert.strictEqual(checkAnswer('how much is this', ['How much is this?']).correct, true);
assert.strictEqual(checkAnswer('I am just looking', ["I'm just looking."]).correct, true);
assert.strictEqual(checkAnswer('I cannot', ["I can't"]).correct, true);

// 複数の正解のどれかに一致すれば正解
assert.strictEqual(checkAnswer('bill please', ['Check, please.', 'Bill, please.']).correct, true);

// 不正解時の差分
const r = checkAnswer('Where station?', ['Where is the station?']);
assert.strictEqual(r.correct, false);
assert.deepStrictEqual(
  r.diff.map(d => `${d.type}:${d.word}`),
  ['ok:where', 'missing:is', 'missing:the', 'ok:station'],
);
const r2 = checkAnswer('I am a student boy', ["I'm a student."]);
assert.deepStrictEqual(r2.diff.filter(d => d.type === 'extra').map(d => d.word), ['boy']);

// 空入力
assert.strictEqual(checkAnswer('', ['Hello.']).correct, false);

// データの整合性: 各模範解答は自分自身で正解になる
const catIds = new Set(CATEGORIES.map(c => c.id));
for (const s of SENTENCES) {
  assert.ok(catIds.has(s.cat), `unknown category: ${s.cat}`);
  assert.ok(s.answers.length > 0, `no answers: ${s.ja}`);
  for (const a of s.answers) assert.strictEqual(checkAnswer(a, s.answers).correct, true, a);
}

console.log(`OK: all tests passed (${SENTENCES.length} sentences)`);
