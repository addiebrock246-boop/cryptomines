import json
import logging
from http import HTTPStatus
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = "7129346547:AAFVXqR30l27yg6rCwgymPe85gbbaPriQVo"
GAME_URL = "https://cryptomines.vercel.app"
PHOTO_URL = "https://cryptomines.vercel.app/dia.jpeg"

application = Application.builder().token(BOT_TOKEN).build()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
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
        keyboard = [[InlineKeyboardButton("🎮 Launch Game", web_app=WebAppInfo(url=GAME_URL))]]
        await update.message.reply_text(
            "Ready to play?",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
    except Exception as e:
        logger.error(f"Error in start: {e}")

application.add_handler(CommandHandler("start", start))

async def handler(request):
    if request.method == "POST":
        try:
            body = await request.json()
            logger.info(f"Received update: {body}")
            await application.initialize()
            update = Update.de_json(body, application.bot)
            await application.process_update(update)
            return {
                "statusCode": HTTPStatus.OK,
                "body": json.dumps({"success": True})
            }
        except Exception as e:
            logger.error(f"Handler error: {e}")
            return {
                "statusCode": HTTPStatus.INTERNAL_SERVER_ERROR,
                "body": json.dumps({"error": str(e)})
            }
    else:
        return {
            "statusCode": HTTPStatus.METHOD_NOT_ALLOWED,
            "body": "Use POST method"
        }
