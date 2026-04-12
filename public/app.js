const newsListEl = document.getElementById('newsList');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const errorMessageEl = document.getElementById('errorMessage');
const noResultsEl = document.getElementById('noResults');
const refreshBtn = document.getElementById('refreshBtn');
const statusTextEl = document.getElementById('statusText');
const langFilterEl = document.getElementById('langFilter');

let allItems = [];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function createCard(item) {
  const card = document.createElement('article');
  card.className = 'news-card';

  const thumbHtml = item.thumbnail
    ? `<img class="card-thumbnail" src="${escapeHtml(item.thumbnail)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<div class=card-thumbnail-placeholder>⭐</div>'">`
    : '<div class="card-thumbnail-placeholder">⭐</div>';

  const dateHtml = item.pubDate
    ? `<span class="card-date">${formatDate(item.pubDate)}</span>`
    : '';

  const langLabel = item.lang === 'ja' ? '日本語' : 'English';

  card.innerHTML = `
    ${thumbHtml}
    <div class="card-body">
      <div class="card-meta">
        <span class="badge-source">${escapeHtml(item.source)}</span>
        <span class="badge-lang">${langLabel}</span>
        ${dateHtml}
      </div>
      <h2 class="card-title">
        <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(item.title)}
        </a>
      </h2>
      ${item.snippet ? `<p class="card-snippet">${escapeHtml(item.snippet)}...</p>` : ''}
      <a class="card-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">
        記事を読む →
      </a>
    </div>
  `;
  return card;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderItems(items) {
  newsListEl.innerHTML = '';
  noResultsEl.classList.add('hidden');

  if (items.length === 0) {
    noResultsEl.classList.remove('hidden');
    return;
  }

  const fragment = document.createDocumentFragment();
  items.forEach(item => fragment.appendChild(createCard(item)));
  newsListEl.appendChild(fragment);
}

function applyFilter() {
  const lang = langFilterEl.value;
  const filtered = lang === 'all'
    ? allItems
    : allItems.filter(item => item.lang === lang);
  renderItems(filtered);
  statusTextEl.textContent = `${filtered.length} 件表示中`;
}

async function fetchNews() {
  refreshBtn.disabled = true;
  loadingEl.classList.remove('hidden');
  errorEl.classList.add('hidden');
  newsListEl.innerHTML = '';
  noResultsEl.classList.add('hidden');
  statusTextEl.textContent = '取得中...';

  try {
    const res = await fetch('/api/news');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.success) throw new Error(data.error || '取得エラー');

    allItems = data.items;

    const fetched = new Date(data.fetchedAt);
    const timeStr = fetched.toLocaleTimeString('ja-JP');
    statusTextEl.textContent = '';

    applyFilter();

    if (allItems.length === 0) {
      statusTextEl.textContent = `更新: ${timeStr} | 0 件`;
    } else {
      const lang = langFilterEl.value;
      const shown = lang === 'all' ? allItems.length : allItems.filter(i => i.lang === lang).length;
      statusTextEl.textContent = `更新: ${timeStr} | ${shown} 件`;
    }
  } catch (err) {
    errorMessageEl.textContent = `エラー: ${err.message}`;
    errorEl.classList.remove('hidden');
    statusTextEl.textContent = '取得失敗';
  } finally {
    loadingEl.classList.add('hidden');
    refreshBtn.disabled = false;
  }
}

// イベントリスナー
refreshBtn.addEventListener('click', fetchNews);
langFilterEl.addEventListener('change', applyFilter);

// 初回ロード
fetchNews();
