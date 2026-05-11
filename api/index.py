import json
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler

BOT_TOKEN = "7129346547:AAFVXqR30l27yg6rCwgymPe85gbbaPriQVo"
GAME_URL = "https://cryptomines.vercel.app"
PHOTO_URL = "https://cryptomines.vercel.app/dia.jpeg"

# Telegram app
application = Application.builder().token(BOT_TOKEN).build()

async def start(update: Update, context):
    # Photo bhejo
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
    # Button bhejo
    keyboard = [[InlineKeyboardButton("🎮 Launch Game", web_app=WebAppInfo(url=GAME_URL))]]
    await update.message.reply_text(
        "Ready to play?",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

application.add_handler(CommandHandler("start", start))

# ------------------------------------------------------------
# Vercel serverless handler (native, no Flask needed)
async def handler(request):
    """Vercel ke liye entry point"""
    await application.initialize()
    body = await request.json()
    update = Update.de_json(body, application.bot)
    await application.process_update(update)
    return {
        "statusCode": 200,
        "body": json.dumps({"ok": True})
    }
