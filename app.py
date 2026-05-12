import os
from flask import Flask, request
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

BOT_TOKEN = "7129346547:AAFVXqR30l27yg6rCwgymPe85gbbaPriQVo"
GAME_URL = "https://cryptomines.vercel.app"
PHOTO_URL = "https://cryptomines.vercel.app/dia.jpeg"

app = Flask(__name__)
bot_app = Application.builder().token(BOT_TOKEN).build()

@app.route(f"/{BOT_TOKEN}", methods=["POST"])
async def webhook():
    data = request.get_json(force=True)
    update = Update.de_json(data, bot_app.bot)
    await bot_app.process_update(update)
    return {"ok": True}

@app.route("/health", methods=["GET"])
def health():
    return "OK", 200

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await context.bot.send_photo(
        chat_id=update.effective_chat.id,
        photo=PHOTO_URL,
        caption=(
            "🎰 **RK | CryptoMines**\n"
            "▔▔▔▔▔▔▔▔▔▔▔▔▔▔\n"
            "💎 *Real Crypto Mines Game*\n"
            "⛏️ Find diamonds, avoid bombs\n"
            "💰 Win USDT by playing!\n"
            "📌 Minimum Deposit: 10 USDT\n"
            "🔗 BNB Smart Chain (BEP20)\n\n"
            "👇 Tap the button below to play!"
        ),
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("🎮 Launch Game", web_app=WebAppInfo(url=GAME_URL))
        ]])
    )

bot_app.add_handler(CommandHandler("start", start))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
