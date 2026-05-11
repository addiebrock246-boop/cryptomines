from flask import Flask, request
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

BOT_TOKEN = "7129346547:AAFVXqR30l27yg6rCwgymPe85gbbaPriQVo"
GAME_URL = "https://cryptomines.vercel.app"
PHOTO_URL = "https://cryptomines.vercel.app/dia.jpeg"

# Flask app
app = Flask(__name__)

# Telegram application
application = Application.builder().token(BOT_TOKEN).build()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Send photo
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
        parse_mode="Markdown"
    )
    # Send launch button
    keyboard = [[InlineKeyboardButton("🎮 Launch Game", web_app=WebAppInfo(url=GAME_URL))]]
    await update.message.reply_text(
        "Ready to play?",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

application.add_handler(CommandHandler("start", start))

@app.route("/api", methods=["POST"])
async def webhook():
    """Telegram updates yahan aate hain"""
    await application.initialize()
    data = request.get_json()
    update = Update.de_json(data, application.bot)
    await application.process_update(update)
    return {"ok": True}

# Vercel ke liye handler
def handler(request):
    return app(request.environ, start_response)
