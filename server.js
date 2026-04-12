const express = require('express');
const Parser = require('rss-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'KirbyNewsApp/1.0',
  },
});

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// カービィ関連のキーワード
const KIRBY_KEYWORDS = [
  'kirby', 'カービィ', 'カービー', '星のカービィ',
  'Kirby and the Forgotten Land',
  'Kirby\'s Return to Dream Land',
  'HAL Laboratory',
];

// ニュースフィード一覧
const RSS_FEEDS = [
  {
    name: 'Nintendo Life',
    url: 'https://www.nintendolife.com/feeds/latest',
    lang: 'en',
  },
  {
    name: 'Gematsu',
    url: 'https://gematsu.com/feed',
    lang: 'en',
  },
  {
    name: 'Nintendo Everything',
    url: 'https://nintendoeverything.com/feed',
    lang: 'en',
  },
  {
    name: 'ファミ通',
    url: 'https://www.famitsu.com/feed/news',
    lang: 'ja',
  },
  {
    name: '4Gamer.net - Nintendo',
    url: 'https://www.4gamer.net/rss/010/G010.xml',
    lang: 'ja',
  },
];

// カービィ関連か判定する
function isKirbyRelated(item) {
  const text = `${item.title || ''} ${item.contentSnippet || ''} ${item.content || ''}`.toLowerCase();
  return KIRBY_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
}

// 単一フィードを取得
async function fetchFeed(feed) {
  try {
    const result = await parser.parseURL(feed.url);
    const kirbyItems = result.items.filter(isKirbyRelated);
    return kirbyItems.map(item => ({
      title: item.title || '(タイトルなし)',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || null,
      snippet: (item.contentSnippet || item.summary || '').slice(0, 200),
      thumbnail: extractThumbnail(item),
      source: feed.name,
      lang: feed.lang,
    }));
  } catch (err) {
    console.error(`[${feed.name}] フィード取得エラー:`, err.message);
    return [];
  }
}

// サムネイル画像URLを取得する試み
function extractThumbnail(item) {
  if (item.enclosure && item.enclosure.url) return item.enclosure.url;
  if (item['media:content'] && item['media:content'].url) return item['media:content'].url;
  if (item['media:thumbnail'] && item['media:thumbnail'].url) return item['media:thumbnail'].url;
  // コンテンツから <img> タグを探す
  const html = item['content:encoded'] || item.content || '';
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match) return match[1];
  return null;
}

// 全フィードからカービィニュースを取得するエンドポイント
app.get('/api/news', async (req, res) => {
  try {
    const results = await Promise.all(RSS_FEEDS.map(fetchFeed));
    const allItems = results.flat();

    // 日付順にソート（新しい順）
    allItems.sort((a, b) => {
      const da = a.pubDate ? new Date(a.pubDate) : new Date(0);
      const db = b.pubDate ? new Date(b.pubDate) : new Date(0);
      return db - da;
    });

    res.json({
      success: true,
      count: allItems.length,
      fetchedAt: new Date().toISOString(),
      items: allItems,
    });
  } catch (err) {
    console.error('APIエラー:', err);
    res.status(500).json({ success: false, error: 'ニュースの取得に失敗しました。' });
  }
});

// ヘルスチェック
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'kirby-news-app' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`カービィニュースアプリ起動中 → http://localhost:${PORT}`);
});
