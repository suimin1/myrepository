// 初心者向けの例文データ
// answers: 正解として受け付ける英文（最初のものが模範解答として表示される）
const CATEGORIES = [
  { id: 'greeting', name: 'あいさつ', icon: '👋' },
  { id: 'intro', name: '自己紹介', icon: '🙋' },
  { id: 'daily', name: '日常会話', icon: '☀️' },
  { id: 'shopping', name: '買い物', icon: '🛍️' },
  { id: 'restaurant', name: 'レストラン', icon: '🍽️' },
  { id: 'travel', name: '旅行・道案内', icon: '✈️' },
];

const SENTENCES = [
  // あいさつ
  { cat: 'greeting', ja: 'おはようございます。', answers: ['Good morning.'] },
  { cat: 'greeting', ja: 'こんにちは。お元気ですか？', answers: ['Hello. How are you?', 'Hi. How are you?'] },
  { cat: 'greeting', ja: '元気です、ありがとう。', answers: ["I'm fine, thank you.", "I'm fine, thanks.", "I'm good, thank you.", "I'm good, thanks."] },
  { cat: 'greeting', ja: 'はじめまして。', answers: ['Nice to meet you.'] },
  { cat: 'greeting', ja: 'また明日。', answers: ['See you tomorrow.'] },
  { cat: 'greeting', ja: 'ありがとうございます。', answers: ['Thank you.', 'Thank you very much.', 'Thanks.'] },
  { cat: 'greeting', ja: 'どういたしまして。', answers: ["You're welcome."] },
  { cat: 'greeting', ja: 'すみません。', answers: ['Excuse me.', "I'm sorry."] },
  { cat: 'greeting', ja: 'おやすみなさい。', answers: ['Good night.'] },
  { cat: 'greeting', ja: '良い一日を。', answers: ['Have a nice day.', 'Have a good day.'] },

  // 自己紹介
  { cat: 'intro', ja: '私の名前はケンです。', answers: ['My name is Ken.', "I'm Ken."] },
  { cat: 'intro', ja: '私は日本出身です。', answers: ["I'm from Japan.", 'I come from Japan.'] },
  { cat: 'intro', ja: '私は東京に住んでいます。', answers: ['I live in Tokyo.'] },
  { cat: 'intro', ja: '私は学生です。', answers: ["I'm a student."] },
  { cat: 'intro', ja: '私は会社員です。', answers: ["I'm an office worker.", 'I work for a company.'] },
  { cat: 'intro', ja: '私の趣味は読書です。', answers: ['My hobby is reading.', 'I like reading.'] },
  { cat: 'intro', ja: '私は音楽を聴くのが好きです。', answers: ['I like listening to music.', 'I like to listen to music.'] },
  { cat: 'intro', ja: '私は英語を勉強しています。', answers: ["I'm studying English.", 'I study English.'] },
  { cat: 'intro', ja: '私は25歳です。', answers: ["I'm 25 years old.", "I'm twenty-five years old.", "I'm 25."] },
  { cat: 'intro', ja: 'あなたの名前は何ですか？', answers: ["What's your name?"] },

  // 日常会話
  { cat: 'daily', ja: '今日は暑いですね。', answers: ["It's hot today.", "It's hot today, isn't it?"] },
  { cat: 'daily', ja: '今何時ですか？', answers: ['What time is it now?', 'What time is it?'] },
  { cat: 'daily', ja: 'お腹がすきました。', answers: ["I'm hungry."] },
  { cat: 'daily', ja: '少し疲れています。', answers: ["I'm a little tired.", "I'm a bit tired."] },
  { cat: 'daily', ja: 'もう一度言ってください。', answers: ['Please say that again.', 'Could you say that again?', 'Can you say that again?', 'Pardon?'] },
  { cat: 'daily', ja: 'ゆっくり話してください。', answers: ['Please speak slowly.', 'Please speak more slowly.', 'Could you speak more slowly?'] },
  { cat: 'daily', ja: '分かりません。', answers: ["I don't understand.", "I don't know."] },
  { cat: 'daily', ja: '週末は何をしましたか？', answers: ['What did you do on the weekend?', 'What did you do last weekend?', 'What did you do over the weekend?'] },
  { cat: 'daily', ja: '私はコーヒーが好きです。', answers: ['I like coffee.'] },
  { cat: 'daily', ja: '手伝ってもらえますか？', answers: ['Can you help me?', 'Could you help me?'] },

  // 買い物
  { cat: 'shopping', ja: 'これはいくらですか？', answers: ['How much is this?'] },
  { cat: 'shopping', ja: 'ちょっと見ているだけです。', answers: ["I'm just looking."] },
  { cat: 'shopping', ja: 'これを試着してもいいですか？', answers: ['Can I try this on?', 'May I try this on?'] },
  { cat: 'shopping', ja: 'もっと小さいサイズはありますか？', answers: ['Do you have a smaller size?', 'Do you have this in a smaller size?'] },
  { cat: 'shopping', ja: 'これをください。', answers: ["I'll take this.", "I'll take it.", 'This one, please.'] },
  { cat: 'shopping', ja: 'クレジットカードは使えますか？', answers: ['Can I use a credit card?', 'Do you accept credit cards?', 'Can I pay by credit card?'] },
  { cat: 'shopping', ja: '袋はいりません。', answers: ["I don't need a bag."] },
  { cat: 'shopping', ja: '別の色はありますか？', answers: ['Do you have another color?', 'Do you have this in another color?', 'Do you have a different color?'] },

  // レストラン
  { cat: 'restaurant', ja: '2人です。', answers: ['Two, please.', 'Table for two, please.', 'A table for two, please.'] },
  { cat: 'restaurant', ja: 'メニューを見せてください。', answers: ['Can I see the menu?', 'Could I see the menu?', 'May I see the menu?', 'The menu, please.'] },
  { cat: 'restaurant', ja: 'おすすめは何ですか？', answers: ['What do you recommend?', 'What is your recommendation?'] },
  { cat: 'restaurant', ja: 'これにします。', answers: ["I'll have this.", "I'll have this one."] },
  { cat: 'restaurant', ja: '水をください。', answers: ['Water, please.', 'Can I have some water?', 'Could I have some water?', 'Can I have water, please?'] },
  { cat: 'restaurant', ja: 'お会計をお願いします。', answers: ['Check, please.', 'Can I have the check?', 'Could I have the check, please?', 'Bill, please.', 'Can I have the bill?', 'Could I have the bill, please?'] },
  { cat: 'restaurant', ja: 'とてもおいしいです。', answers: ["It's very good.", "It's delicious.", 'This is delicious.', "It's very delicious."] },
  { cat: 'restaurant', ja: '持ち帰りでお願いします。', answers: ['To go, please.', 'Takeout, please.'] },

  // 旅行・道案内
  { cat: 'travel', ja: '駅はどこですか？', answers: ['Where is the station?', 'Where is the train station?'] },
  { cat: 'travel', ja: 'トイレはどこですか？', answers: ['Where is the restroom?', 'Where is the bathroom?', 'Where is the toilet?'] },
  { cat: 'travel', ja: '道に迷いました。', answers: ["I'm lost.", 'I got lost.'] },
  { cat: 'travel', ja: 'ここから遠いですか？', answers: ['Is it far from here?'] },
  { cat: 'travel', ja: '写真を撮ってもらえますか？', answers: ['Could you take a picture?', 'Can you take a picture?', 'Could you take a picture of us?', 'Can you take our picture?', 'Could you take a photo?', 'Can you take a photo?'] },
  { cat: 'travel', ja: 'チェックインをお願いします。', answers: ["I'd like to check in.", 'Check in, please.'] },
  { cat: 'travel', ja: '予約しています。', answers: ['I have a reservation.'] },
  { cat: 'travel', ja: 'この電車は空港に行きますか？', answers: ['Does this train go to the airport?'] },
  { cat: 'travel', ja: '観光で来ました。', answers: ["I'm here for sightseeing.", "I'm here on vacation.", "I'm here for vacation."] },
  { cat: 'travel', ja: '5日間滞在します。', answers: ["I'm staying for five days.", "I'll stay for five days.", "I'm staying for 5 days.", "I'll stay for 5 days."] },
];

if (typeof module !== 'undefined') {
  module.exports = { CATEGORIES, SENTENCES };
}
