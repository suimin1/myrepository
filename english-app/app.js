const $ = (id) => document.getElementById(id);

const STORAGE_KEY = 'eikaiwa-drill-stats';
const state = {
  questions: [],
  index: 0,
  hintLevel: 0,
  answered: false,
  correctCount: 0,
  mistakes: [],
};

// ===== 学習記録（localStorage が使えない環境でも動くようにする） =====
function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { answered: 0, correct: 0 };
  } catch {
    return { answered: 0, correct: 0 };
  }
}
function saveStats(stats) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch { /* 無視 */ }
}
function recordResult(isCorrect) {
  const stats = loadStats();
  stats.answered += 1;
  if (isCorrect) stats.correct += 1;
  saveStats(stats);
}

// ===== 画面切り替え =====
function showScreen(name) {
  for (const id of ['startScreen', 'quizScreen', 'resultScreen']) {
    $(id).classList.toggle('hidden', id !== name);
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===== スタート画面 =====
function renderStart() {
  const list = $('categoryList');
  list.innerHTML = '';
  const all = { id: 'all', name: 'ぜんぶ', icon: '🌟' };
  for (const cat of [all, ...CATEGORIES]) {
    const count = cat.id === 'all' ? SENTENCES.length : SENTENCES.filter(s => s.cat === cat.id).length;
    const btn = document.createElement('button');
    btn.className = 'category-btn';
    btn.innerHTML = `<span class="icon">${cat.icon}</span>${escapeHtml(cat.name)}<span class="count">${count}問</span>`;
    btn.addEventListener('click', () => startQuiz(cat.id));
    list.appendChild(btn);
  }
  const stats = loadStats();
  $('totalStats').textContent = stats.answered
    ? `これまでの成績: ${stats.answered}問中 ${stats.correct}問正解（正答率 ${Math.round(stats.correct / stats.answered * 100)}%）`
    : 'まずはカテゴリを選んで始めてみましょう！';
  showScreen('startScreen');
}

function startQuiz(catId) {
  const pool = catId === 'all' ? SENTENCES : SENTENCES.filter(s => s.cat === catId);
  const count = Number($('questionCount').value);
  beginQuestions(shuffle(pool).slice(0, count));
}

function beginQuestions(questions) {
  state.questions = questions;
  state.index = 0;
  state.correctCount = 0;
  state.mistakes = [];
  showScreen('quizScreen');
  renderQuestion();
}

// ===== 出題 =====
function renderQuestion() {
  const q = state.questions[state.index];
  state.hintLevel = 0;
  state.answered = false;

  $('progressText').textContent = `${state.index + 1} / ${state.questions.length}`;
  $('progressBar').style.width = `${(state.index / state.questions.length) * 100}%`;
  $('jaText').textContent = q.ja;
  $('hintText').classList.add('hidden');
  $('feedback').classList.add('hidden');
  $('micStatus').textContent = '';
  const input = $('answerInput');
  input.value = '';
  input.disabled = false;
  for (const id of ['checkBtn', 'hintBtn', 'skipBtn', 'micBtn']) $(id).disabled = false;
  $('micBtn').disabled = !recognition;
  input.focus();
}

// ヒントは段階的に: 単語数 → 最初の単語 → 単語の頭文字
function showHint() {
  const words = state.questions[state.index].answers[0].replace(/[.,!?]/g, '').split(' ');
  state.hintLevel = Math.min(state.hintLevel + 1, 3);
  let text;
  if (state.hintLevel === 1) {
    text = `ヒント①: ${words.length}語の文です`;
  } else if (state.hintLevel === 2) {
    text = `ヒント②: 「${words[0]} …」で始まります`;
  } else {
    text = `ヒント③: ${words.map(w => w[0] + '_'.repeat(Math.max(w.length - 1, 0))).join(' ')}`;
  }
  $('hintText').textContent = text;
  $('hintText').classList.remove('hidden');
}

function submitAnswer(skipped) {
  if (state.answered) return;
  const q = state.questions[state.index];
  const userText = $('answerInput').value.trim();
  if (!skipped && !userText) {
    $('answerInput').focus();
    return;
  }
  state.answered = true;
  stopListening();

  const result = skipped
    ? { correct: false, closestAnswer: q.answers[0], diff: [] }
    : checkAnswer(userText, q.answers);

  if (result.correct) {
    state.correctCount += 1;
  } else {
    state.mistakes.push({ q, userText: skipped ? '' : userText });
  }
  recordResult(result.correct);

  // フィードバック表示
  const title = $('feedbackTitle');
  if (result.correct) {
    title.textContent = state.hintLevel > 0 ? '⭕ 正解！（ヒントあり）' : '⭕ 正解！すばらしい！';
    title.className = 'feedback-title ok';
  } else if (skipped) {
    title.textContent = '答えを確認して、声に出して言ってみよう';
    title.className = 'feedback-title ng';
  } else {
    title.textContent = `❌ おしい！（一致度 ${result.score}%）`;
    title.className = 'feedback-title ng';
  }

  const diffView = $('diffView');
  if (result.diff.length) {
    diffView.innerHTML = result.diff
      .map(d => `<span class="${d.type}">${escapeHtml(d.word)}</span>`)
      .join('') + '<p class="diff-legend">緑 = 合っている / 赤の取り消し線 = 余分 / 黄色の点線 = 足りない単語</p>';
  } else {
    diffView.innerHTML = '';
  }

  // 模範解答（入力に一番近いもの）と、その他の言い方
  const model = result.correct ? result.closestAnswer : q.answers[0];
  $('modelAnswer').textContent = model;
  const others = q.answers.filter(a => a !== model);
  $('otherAnswers').textContent = others.length ? `他の言い方: ${others.join(' / ')}` : '';

  $('answerInput').disabled = true;
  for (const id of ['checkBtn', 'hintBtn', 'skipBtn', 'micBtn']) $(id).disabled = true;
  $('feedback').classList.remove('hidden');
  speak(model);
}

function nextQuestion() {
  state.index += 1;
  if (state.index >= state.questions.length) {
    renderResult();
  } else {
    renderQuestion();
  }
}

// ===== 結果画面 =====
function renderResult() {
  const total = state.questions.length;
  const rate = Math.round((state.correctCount / total) * 100);
  $('resultScore').textContent = `${state.correctCount} / ${total}`;
  $('resultMessage').textContent =
    rate === 100 ? 'パーフェクト！この調子で続けましょう 🎉'
      : rate >= 70 ? 'よくできました！間違えた文を声に出して復習しよう 👍'
        : 'ナイスチャレンジ！くり返すと必ず言えるようになります 💪';

  const list = $('reviewList');
  list.innerHTML = '';
  for (const m of state.mistakes) {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="ja">${escapeHtml(m.q.ja)}</div>
      <div class="en">${escapeHtml(m.q.answers[0])}
        <button class="btn-icon small" title="発音を聞く" aria-label="発音を聞く">🔊</button></div>
      ${m.userText ? `<div class="yours">あなたの答え: ${escapeHtml(m.userText)}</div>` : ''}`;
    li.querySelector('button').addEventListener('click', () => speak(m.q.answers[0]));
    list.appendChild(li);
  }
  $('reviewBox').classList.toggle('hidden', state.mistakes.length === 0);
  $('retryBtn').classList.toggle('hidden', state.mistakes.length === 0);
  $('progressBar').style.width = '100%';
  showScreen('resultScreen');
}

// ===== 音声（読み上げ・音声入力。対応ブラウザのみ） =====
function speak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.85; // 初心者向けに少しゆっくり
  window.speechSynthesis.speak(u);
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
let listening = false;

if (recognition) {
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.addEventListener('result', (e) => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
    $('answerInput').value = transcript;
  });
  recognition.addEventListener('end', () => {
    listening = false;
    $('micBtn').classList.remove('listening');
    if (!state.answered) $('micStatus').textContent = '認識が終わりました。内容を確認して「答え合わせ」を押してください';
  });
  recognition.addEventListener('error', (e) => {
    $('micStatus').textContent = `音声入力エラー: ${e.error}`;
  });
}

function toggleListening() {
  if (!recognition) return;
  if (listening) {
    stopListening();
    return;
  }
  try {
    recognition.start();
    listening = true;
    $('micBtn').classList.add('listening');
    $('micStatus').textContent = '🎙️ 英語で話してください…';
  } catch (err) {
    $('micStatus').textContent = `音声入力を開始できませんでした: ${err.message}`;
  }
}

function stopListening() {
  if (recognition && listening) recognition.stop();
}

// ===== イベント =====
$('checkBtn').addEventListener('click', () => submitAnswer(false));
$('skipBtn').addEventListener('click', () => submitAnswer(true));
$('hintBtn').addEventListener('click', showHint);
$('nextBtn').addEventListener('click', nextQuestion);
$('micBtn').addEventListener('click', toggleListening);
$('speakBtn').addEventListener('click', () => speak($('modelAnswer').textContent));
$('quitBtn').addEventListener('click', () => { stopListening(); renderStart(); });
$('homeBtn').addEventListener('click', renderStart);
$('retryBtn').addEventListener('click', () => beginQuestions(shuffle(state.mistakes.map(m => m.q))));
$('answerInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.isComposing) {
    e.stopPropagation(); // 同じ Enter で「次へ」まで進まないようにする
    submitAnswer(false);
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && state.answered && document.activeElement !== $('nextBtn')
      && !$('quizScreen').classList.contains('hidden')) {
    nextQuestion();
  }
});

if (!recognition) {
  $('micBtn').title = 'このブラウザは音声入力に対応していません';
}

renderStart();
