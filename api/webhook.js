// api/webhook.js
const BOT_TOKEN = '7129346547:AAFVXqR30l27yg6rCwgymPe85gbbaPriQVo';
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const GAME_URL = 'https://cryptomines.vercel.app';
const PHOTO_URL = 'https://cryptomines.vercel.app/dia.jpeg';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const msg = body && body.message;
    if (!msg || !msg.text || !msg.text.startsWith('/start')) {
      return res.status(200).json({ ok: true });
    }

    const chatId = msg.chat.id;
    await fetch(`${BASE_URL}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: PHOTO_URL,
        caption: (
          "🎰 **RK | CryptoMines**\n" +
          "▔▔▔▔▔▔▔▔▔▔▔▔▔▔\n" +
          "💎 *Real Crypto Mines Game*\n" +
          "⛏️ Find diamonds, avoid bombs\n" +
          "💰 Win USDT by playing!\n" +
          "📌 Minimum Deposit: 10 USDT\n" +
          "🔗 BNB Smart Chain (BEP20)\n\n" +
          "👇 Tap the button below to play!"
        ),
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{
            text: "🎮 Launch Game",
            web_app: { url: GAME_URL }
          }]]
        }
      })
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
