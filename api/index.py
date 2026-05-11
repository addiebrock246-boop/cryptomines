import json
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

BOT_TOKEN = "7129346547:AAFVXqR30l27yg6rCwgymPe85gbbaPriQVo"
GAME_URL = "https://cryptomines.vercel.app"
PHOTO_URL = "https://cryptomines.vercel.app/dia.jpeg"   # <--- yahan update

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
        parse_mode="Markdown"
    )
    keyboard = [
        [InlineKeyboardButton("🎮 Launch Game", web_app=WebAppInfo(url=GAME_URL))]
    ]
    await update.message.reply_text(
        "Ready to play?",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

application = Application.builder().token(BOT_TOKEN).build()
application.add_handler(CommandHandler("start", start))

async def handler(request):
    if request.method == "POST":
        body = await request.body()
        update = Update.de_json(json.loads(body), application.bot)
        await application.initialize()
        await application.process_update(update)
        return {"status": "ok"}
    return {"status": "webhook active"}
