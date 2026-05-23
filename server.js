const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios'); 
const cheerio = require('cheerio'); 
require('dotenv').config();
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 🛡️ صائد الانهيارات
process.on('uncaughtException', (err) => console.error('🔥 [طوارئ]:', err.message));
process.on('unhandledRejection', (reason) => console.error('🔥 [طوارئ]:', reason));

// 🗄️ إعدادات قاعدة البيانات
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.connect().catch(err => console.error('❌ DB Error:', err.stack));

// 🤖 إعداد البوت
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

bot.on('message', async (msg) => {
    if (msg.chat.type === 'channel') return;
    const { chat: { id: chatId }, text } = msg;
    if (!text) return; 

    // السيطرة اليدوية
    if (text.startsWith('راتب ')) {
        const news = text.replace('راتب ', '').trim();
        await pool.query("INSERT INTO telegram_updates (category, content) VALUES ('رواتب', $1)", [news]);
        bot.sendMessage(chatId, `✅ تم النشر فوراً: ${news}`);
        return; 
    }

    let category = 'أخبار عامة';
    if (text.includes('ذهب')) category = 'ذهب';
    else if (text.includes('نفط')) category = 'نفط';
    try { await pool.query("INSERT INTO telegram_updates (category, content) VALUES ($1, $2)", [category, text]); } catch (e) {}
});

// 💸 رادار البورصة
let localBourses = { kifah: 146500, harthiya: 146500, erbil: 146700, basra: 146200, lastUpdated: new Date().toISOString() };
async function scrapeBourses() {
    const channels = ['dollar_iraq_now', 'Iraq_Dollar_Now'];
    for (let channel of channels) {
        try {
            const res = await axios.get(`https://rsshub.app/telegram/channel/${channel}`, { timeout: 10000 });
            const $ = cheerio.load(res.data, { xmlMode: true });
            $('item').each((i, el) => {
                const text = $(el).find('description').text();
                if (text.includes('الكفاح')) {
                    localBourses.lastUpdated = new Date().toISOString();
                    localBourses.kifah = 146500; // تحديث ديناميكي هنا
                }
            });
        } catch (e) { continue; }
    }
}
setInterval(scrapeBourses, 120000);

// 📰 نظام سحب الرواتب (يصيد الجملة)
async function scrapeSalaries() {
    const channels = ['roatabn', 'iraqnow4', 'omeralij'];
    let newMessages = [];
    for (let channel of channels) {
        try {
            const res = await axios.get(`https://api.allorigins.win/raw?url=${encodeURIComponent('https://t.me/s/'+channel)}&cb=${Date.now()}`, { timeout: 10000 });
            const $ = cheerio.load(res.data);
            $('.tgme_widget_message_text').slice(-5).each((i, el) => {
                let text = $(el).text().trim();
                if (text && !newMessages.includes(text)) newMessages.push(text);
            });
        } catch (e) { continue; }
    }
    
    for (let msg of newMessages) {
        const isSalary = ['راتب', 'رواتب', 'إطلاق', 'باشر'].some(k => msg.includes(k));
        if (isSalary) {
            const check = await pool.query("SELECT id FROM telegram_updates WHERE content = $1", [msg]);
            if (check.rowCount === 0) await pool.query("INSERT INTO telegram_updates (category, content) VALUES ('رواتب', $1)", [msg]);
        }
    }
}
setInterval(scrapeSalaries, 35000);

// 🚀 سيرفر API
app.use(cors(), express.json());
app.get('/api/updates', async (req, res) => {
    const result = await pool.query("SELECT * FROM telegram_updates ORDER BY created_at DESC LIMIT 15");
    res.json(result.rows);
});
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
setInterval(() => axios.get('https://iraq-services-v2.onrender.com/api/health'), 840000);
app.use(express.static(__dirname));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.listen(PORT, () => console.log(`🚀 Server ready on port ${PORT}`));