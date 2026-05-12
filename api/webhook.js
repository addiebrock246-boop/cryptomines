// api/webhook.js
const BOT_TOKEN = '7129346547:AAFVXqR30l27yg6rCwgymPe85gbbaPriQVo';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const GAME_URL = 'https://cryptomines.vercel.app';
const PHOTO_URL = 'https://cryptomines.vercel.app/dia.jpeg';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const message = body?.message;
    const text = message?.text?.trim();
    const chatId = message?.chat?.id;

    if (text === '/start' && chatId) {
      // Send photo with caption and inline keyboard
      const photoRes = await fetch(`${TELEGRAM_API}/sendPhoto`, {
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

      const photoData = await photoRes.json();
      // Agar photo fail ho gaya to ek text message bheje
      if (!photoRes.ok) {
        console.error('sendPhoto error:', photoData);
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `❌ Photo send failed: ${photoData.description}`
          })
        });
      }
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
};
