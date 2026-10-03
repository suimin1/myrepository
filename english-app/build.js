// index.html に CSS と JS を埋め込み、1ファイルだけで動く eikaiwa.html を作る
// 実行: node english-app/build.js
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const read = (name) => fs.readFileSync(path.join(dir, name), 'utf8');

let html = read('index.html');
html = html.replace(
  '<link rel="stylesheet" href="style.css" />',
  () => `<style>\n${read('style.css')}</style>`,
);
for (const name of ['data.js', 'checker.js', 'app.js']) {
  html = html.replace(
    `<script src="${name}"></script>`,
    () => `<script>\n${read(name).replace(/<\/script/gi, '<\\/script')}</script>`,
  );
}
if (/href="style\.css"|<script src=/.test(html)) {
  throw new Error('埋め込みに失敗しました');
}
fs.writeFileSync(path.join(dir, 'eikaiwa.html'), html);
console.log('eikaiwa.html を作成しました');
