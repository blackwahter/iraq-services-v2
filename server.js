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

// ==========================================
// 🛡️ صائد الانهيارات (تأمين السيرفر)
// ==========================================
process.on('uncaughtException', (err) => {
    console.error('🔥 [طوارئ]: تم منع انهيار السيرفر:', err.message);
});
process.on('unhandledRejection', (reason) => {
    console.error('🔥 [طوارئ]: رفض غير معالج:', reason);
});

// ==========================================
// 🗄️ إعدادات قاعدة البيانات (PostgreSQL - Neon Cloud)
// ==========================================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect()
    .then(() => console.log('✅ Connected to PostgreSQL successfully!'))
    .catch(err => console.error('❌ Database connection error:', err.stack));

const initDB = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS telegram_updates (
            id SERIAL PRIMARY KEY,
            category VARCHAR(50) NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(createTableQuery);
        console.log('✅ Database tables are ready!');
    } catch (err) {}
};
initDB();

// ==========================================
// 🤖 إعداد بوت تيليجرام (تلقائي + سيطرة المطور)
// ==========================================
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    if (msg.chat.type === 'channel') return;
    const chatId = msg.chat.id;
    const text = msg.text;
    if (!text) return; 

    // 👑 النشر اليدوي الفوري (اكتب: راتب + الخبر)
    if (text.startsWith('راتب ')) {
        const news = text.replace('راتب ', '').trim();
        try {
            const insertQuery = `INSERT INTO telegram_updates (category, content) VALUES ($1, $2) RETURNING *`;
            await pool.query(insertQuery, ['رواتب', news]);
            bot.sendMessage(chatId, `✅ تم إطلاق الخبر بالموقع فوراً!\nالخبر: ${news}`);
        } catch (err) {
            bot.sendMessage(chatId, `❌ خطأ بالنشر: ${err.message}`);
        }
        return; 
    }

    let category = 'أخبار عامة';
    if (text.includes('ذهب') || text.includes('غرام')) category = 'ذهب';
    else if (text.includes('نفط') || text.includes('برميل')) category = 'نفط';

    try {
        const insertQuery = `INSERT INTO telegram_updates (category, content) VALUES ($1, $2) RETURNING *`;
        await pool.query(insertQuery, [category, text]);
        bot.sendMessage(chatId, `✅ تم استلام وحفظ تحديث (${category}) بنجاح!`);
    } catch (err) {}
});

bot.on('channel_post', async (msg) => {
    const text = msg.text;
    if (!text) return; 

    let category = 'أخبار عامة';
    if (text.includes('ذهب') || text.includes('غرام') || text.includes('مثقال')) category = 'ذهب';
    else if (text.includes('نفط') || text.includes('برميل')) category = 'نفط';
    else if (text.includes('دولار') || text.includes('صرف') || text.includes('الكفاح')) category = 'عملات';

    try {
        const insertQuery = `INSERT INTO telegram_updates (category, content) VALUES ($1, $2) RETURNING *`;
        await pool.query(insertQuery, [category, text]);
    } catch (err) {}
});

// ==========================================
// 💸 نظام رادار البورصات المحلية (متعدد القنوات وكاسر الكاش)
// ==========================================
let localBourses = {
    kifah: 146500, harthiya: 146500, erbil: 146700, basra: 146200,
    lastUpdated: new Date().toISOString() 
};

function extractIraqiRate(text, cityName) {
    const index = text.indexOf(cityName);
    if (index === -1) return null;
    const slice = text.substring(index, index + 40);
    const match = slice.match(/1[3-7][0-9][.,]?[0-9]{2,3}/);
    if (match) {
        let cleanNum = match[0].replace(/[.,]/g, '');
        if (cleanNum.length === 5) cleanNum += '0'; 
        return parseInt(cleanNum);
    }
    return null;
}

async function scrapeBourses() {
    const channels = ['dollar_iraq_now', 'Iraq_Dollar_Now']; // قنوات الدولار
    let found = false;

    for (let channel of channels) {
        if (found) break; // بمجرد إيجاد سعر جديد نتوقف
        
        try {
            // سحب مباشر وسريع بدون كاش أو وسطاء
            const response = await axios.get(`https://t.me/s/${channel}?q=${encodeURIComponent('الكفاح')}`, { 
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                timeout: 8000 
            });
            const $ = cheerio.load(response.data);
            const messages = $('.tgme_widget_message_text');
            
            const processText = (text) => {
                if (text.includes('الكفاح') || text.includes('صرف')) {
                    const k = extractIraqiRate(text, 'الكفاح');
                    if (k) {
                        localBourses.kifah = k;
                        localBourses.harthiya = extractIraqiRate(text, 'الحارثية') || k;
                        localBourses.erbil = extractIraqiRate(text, 'اربيل') || localBourses.erbil;
                        localBourses.basra = extractIraqiRate(text, 'البصرة') || localBourses.basra;
                        localBourses.lastUpdated = new Date().toISOString();
                        console.log(`🎯 [بورصة]: تم تحديث الأسعار بنجاح من (${channel})!`);
                        found = true;
                    }
                }
            };

            // فحص الرسائل من الأحدث للأقدم
            for (let i = messages.length - 1; i >= 0; i--) {
                if (!found) processText($(messages[i]).text());
            }
        } catch (err) {
            console.error(`⚠️ تأخير في استجابة قناة البورصة ${channel}`);
        }
    }
    if (!found) console.log('⚠️ [بورصة]: جاري فحص تحديثات الأسعار القادمة...');
}
scrapeBourses();
setInterval(scrapeBourses, 120000); 

// ==========================================
// 📰 نظام سحب أخبار الرواتب (مدرع بـ 3 قنوات وكاسر كاش)
// ==========================================
async function scrapeSalaries() {
    const channels = ['roatabn', 'iraqnow4', 'omeralij', 'marwaan1980']; // قنوات الأخبار والرواتب المعتمدة
    // كلمات مفتاحية دقيقة جداً تخص الرواتب فقط لمنع سحب أخبار عشوائية
    const salaryKeywords = ['راتب', 'رواتب', 'متقاعدين', 'الرعاية الاجتماعية', 'سلفة', 'سلف', 'تمويل', 'أجور'];

    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
    ];

    for (let channel of channels) {
        try {
            // توقف عشوائي بين 1 إلى 3 ثوانٍ قبل فحص كل قناة لتجنب البلوك (Anti-Ban Delay)
            await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 2000) + 1000));
            
            const randomAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
            
            // سحب مباشر وسريع بدون وسيط
            const response = await axios.get(`https://t.me/s/${channel}`, { 
                headers: { 'User-Agent': randomAgent },
                timeout: 8000 
            });
            const $ = cheerio.load(response.data);
            const messages = $('.tgme_widget_message_text');
            
            // فحص آخر 5 رسائل في القناة لتجنب تفويت أي رسالة
            const numMessagesToCheck = Math.min(messages.length, 5);
            for (let i = messages.length - numMessagesToCheck; i < messages.length; i++) {
                let msgText = $(messages[i]).text().trim();
                if (!msgText) continue;

                // هل يحتوي على كلمات مفتاحية للرواتب؟
                const isSalaryNews = salaryKeywords.some(keyword => msgText.includes(keyword));
                if (!isSalaryNews) continue;

                // التأكد أن الخبر غير موجود مسبقاً في قاعدة البيانات
                const checkQuery = await pool.query("SELECT id FROM telegram_updates WHERE category = 'رواتب' AND content = $1", [msgText]);
                if (checkQuery.rows.length === 0) {
                    console.log(`🔍 [رواتب]: تم صيد خبر جديد من ${channel} ونشره فوراً!`);
                    await pool.query("INSERT INTO telegram_updates (category, content) VALUES ($1, $2)", ['رواتب', msgText]);
                }
            }
        } catch (e) {
            console.error(`⚠️ تأخير أو حظر مؤقت في استجابة قناة ${channel}`);
        } 
    }
}
scrapeSalaries();
setInterval(scrapeSalaries, 60000); // تم زيادتها إلى 60 ثانية لحماية السيرفر من الحظر

// ==========================================
// 🧹 نظام الصيانة والتنظيف الذكي
// ==========================================
async function cleanOldData() {
    try {
        const deleteQuery = `DELETE FROM telegram_updates WHERE created_at < NOW() - INTERVAL '31 days';`;
        const result = await pool.query(deleteQuery);
        if (result.rowCount > 0) console.log(`🧹 [صيانة]: تم تنظيف ${result.rowCount} أخبار قديمة.`);
    } catch (err) {}
}
cleanOldData();
setInterval(cleanOldData, 86400000); 

// ==========================================
// 🚀 إعدادات خادم الـ API (Express)
// ==========================================
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => { res.json({ status: 'OK', uptime: process.uptime() }); });
app.get('/api/bourses', (req, res) => { res.json({ success: true, data: localBourses }); });

app.get('/api/oil', async (req, res) => {
    try {
        const brentReq = await axios.get('https://query1.finance.yahoo.com/v8/finance/chart/BZ=F');
        const brentPrice = brentReq.data.chart.result[0].meta.regularMarketPrice;
        const wtiReq = await axios.get('https://query1.finance.yahoo.com/v8/finance/chart/CL=F');
        const wtiPrice = wtiReq.data.chart.result[0].meta.regularMarketPrice;
        res.json({ success: true, brent: brentPrice, wti: wtiPrice });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.get('/api/updates', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM telegram_updates ORDER BY created_at DESC LIMIT 300");
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: 'حدث خطأ في السيرفر' }); }
});

app.get('/api/clear-all', async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE telegram_updates;');
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/nuke-all-data', async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE telegram_updates RESTART IDENTITY;');
        res.send("تم المسح بنجاح!");
    } catch (err) { res.status(500).send(err.message); }
});

// ⏰ نظام منع النوم لسيرفرات Render
setInterval(async () => {
    try { await axios.get(`https://iraq-services-v2.onrender.com/api/health`); } catch (e) {}
}, 14 * 60 * 1000); 

app.use(express.static(__dirname));

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

app.listen(PORT, () => {
    console.log(`🌐 Server is running successfully on port ${PORT}`);
    console.log(`🚀 السيرفر بوضعية الطوارئ ومستعد ليوم الرواتب 24/7`);
});