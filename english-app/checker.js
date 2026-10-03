// 回答の採点ロジック（ブラウザと Node の両方で使える）

const CONTRACTIONS = {
  "i'm": 'i am', "you're": 'you are', "we're": 'we are', "they're": 'they are',
  "he's": 'he is', "she's": 'she is', "it's": 'it is', "that's": 'that is',
  "what's": 'what is', "where's": 'where is', "there's": 'there is',
  "i'll": 'i will', "you'll": 'you will', "we'll": 'we will', "it'll": 'it will',
  "i'd": 'i would', "you'd": 'you would', "i've": 'i have', "you've": 'you have',
  "don't": 'do not', "doesn't": 'does not', "didn't": 'did not',
  "isn't": 'is not', "aren't": 'are not', "wasn't": 'was not',
  "can't": 'can not', "cannot": 'can not', "won't": 'will not', "couldn't": 'could not',
  "let's": 'let us',
};

// 比較用に正規化した単語の配列にする
function normalize(text) {
  const cleaned = String(text)
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[.,!?;:"“”()]/g, ' ')
    .replace(/-/g, ' ');
  const words = [];
  for (const raw of cleaned.split(/\s+/)) {
    if (!raw) continue;
    const w = raw.replace(/^'+|'+$/g, '');
    if (!w) continue;
    const expanded = CONTRACTIONS[w];
    if (expanded) words.push(...expanded.split(' '));
    else words.push(w);
  }
  return words;
}

// 2つの単語配列の最長共通部分列（LCS）テーブル
function lcsTable(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  return dp;
}

// 単語単位の差分: ok（一致）/ extra（余分）/ missing（不足）
function wordDiff(userWords, answerWords) {
  const dp = lcsTable(userWords, answerWords);
  const ops = [];
  let i = 0, j = 0;
  while (i < userWords.length && j < answerWords.length) {
    if (userWords[i] === answerWords[j]) {
      ops.push({ type: 'ok', word: answerWords[j] }); i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: 'extra', word: userWords[i] }); i++;
    } else {
      ops.push({ type: 'missing', word: answerWords[j] }); j++;
    }
  }
  while (i < userWords.length) ops.push({ type: 'extra', word: userWords[i++] });
  while (j < answerWords.length) ops.push({ type: 'missing', word: answerWords[j++] });
  return ops;
}

// 回答をチェックして結果を返す
function checkAnswer(userText, answers) {
  const userWords = normalize(userText);
  let best = null;
  for (const answer of answers) {
    const answerWords = normalize(answer);
    const common = lcsTable(userWords, answerWords)[0][0];
    const score = (2 * common) / (userWords.length + answerWords.length || 1);
    if (!best || score > best.score) {
      best = { answer, answerWords, score };
    }
  }
  const correct = best.score === 1;
  return {
    correct,
    score: Math.round(best.score * 100),
    closestAnswer: best.answer,
    diff: correct ? [] : wordDiff(userWords, best.answerWords),
  };
}

if (typeof module !== 'undefined') {
  module.exports = { normalize, wordDiff, checkAnswer };
}
