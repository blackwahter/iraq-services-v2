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
// 🛡️ صائد الانهيارات (تأمين السيرفر من التوقف في أيام الزخم)
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
// 🤖 إعداد بوت تيليجرام (تلقائي + سيطرة المطور اليدوية)
// ==========================================
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    if (msg.chat.type === 'channel') return;
    const chatId = msg.chat.id;
    const text = msg.text;
    if (!text) return; 

    // 👑 سيطرة المطور: النشر اليدوي الفوري للرواتب (فقط اكتب: راتب + الخبر)
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
// 💸 نظام رادار البورصات المحلية (متعدد المصادر)
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
    // 3 خطط طوارئ للبورصة
    const sources = [
        { url: 'https://rsshub.app/telegram/channel/dollar_iraq_now', type: 'rss' },
        { url: `https://api.allorigins.win/raw?url=${encodeURIComponent('https://t.me/s/dollar_iraq_now?q=الكفاح')}`, type: 'html' }
    ];

    let found = false;

    for (let source of sources) {
        if (found) break;
        try {
            const response = await axios.get(source.url, { timeout: 12000 });
            const $ = cheerio.load(response.data, { xmlMode: source.type === 'rss' });
            
            const processText = (text) => {
                if (text.includes('الكفاح') || text.includes('صرف')) {
                    const k = extractIraqiRate(text, 'الكفاح');
                    if (k) {
                        localBourses.kifah = k;
                        localBourses.harthiya = extractIraqiRate(text, 'الحارثية') || k;
                        localBourses.erbil = extractIraqiRate(text, 'اربيل') || localBourses.erbil;
                        localBourses.basra = extractIraqiRate(text, 'البصرة') || localBourses.basra;
                        localBourses.lastUpdated = new Date().toISOString();
                        console.log(`🎯 [بورصة]: تم تحديث الأسعار بنجاح عبر (${source.type})`);
                        found = true;
                    }
                }
            };

            if (source.type === 'rss') {
                $('item').each((i, el) => { if(!found) processText($(el).find('description').text()); });
            } else {
                const messages = $('.tgme_widget_message_text');
                for (let i = messages.length - 1; i >= 0; i--) {
                    if(!found) processText($(messages[i]).text());
                }
            }
        } catch (err) { continue; }
    }
    if (!found) console.log('⚠️ [بورصة]: جاري فحص تحديثات الأسعار القادمة...');
}
scrapeBourses();
setInterval(scrapeBourses, 120000); // يفحص كل دقيقتين

// ==========================================
// 📰 نظام سحب أخبار الرواتب (مدرع ضد اللود في أيام الراتب)
// ==========================================
async function scrapeSalaries() {
    // 3 سيرفرات مختلفة لسحب الأخبار، إذا واحد وكف البقية تشيل الحمل!
    const sources = [
        { url: 'https://rsshub.app/telegram/channel/roatabn', type: 'rss' },
        { url: `https://api.allorigins.win/raw?url=${encodeURIComponent('https://t.me/s/roatabn')}`, type: 'html' },
        { url: `https://api.codetabs.com/v1/proxy?quest=https://t.me/s/roatabn`, type: 'html' }
    ];

    let lastMessage = null;

    for (let source of sources) {
        if (lastMessage) break;
        try {
            const response = await axios.get(source.url, { timeout: 10000 });
            const $ = cheerio.load(response.data, { xmlMode: source.type === 'rss' });
            
            if (source.type === 'rss') {
                const firstItem = $('item').first();
                if (firstItem.length > 0) {
                    lastMessage = firstItem.find('description').text().replace(/<[^>]+>/g, ' ').trim();
                }
            } else {
                const messages = $('.tgme_widget_message_text');
                if (messages.length > 0) {
                    lastMessage = messages.last().text().trim();
                }
            }
        } catch (e) { continue; } // إذا فشل يعبر للثاني بسرعة
    }

    if (!lastMessage) {
        console.log(`⚠️ [رواتب]: ضغط عالي على المصادر، جاري المحاولة بالدورة القادمة...`);
        return;
    }

    try {
        const checkQuery = await pool.query("SELECT content FROM telegram_updates WHERE category = 'رواتب' ORDER BY id DESC LIMIT 1");
        if (checkQuery.rows.length > 0 && checkQuery.rows[0].content === lastMessage) return; 

        // أضفنا كلمات مفتاحية جديدة خاصة بيوم الرواتب
        const salaryKeywords = ['راتب', 'رواتب', 'تمويل', 'مصرف', 'متقاعدين', 'الرعاية', 'صرف', 'موظفي', 'المالية', 'سلفة', 'سلف', 'إطلاق', 'باشر', 'عاجل'];
        const isSalaryNews = salaryKeywords.some(keyword => lastMessage.includes(keyword));

        if (!isSalaryNews) return; 

        console.log(`🔍 [رواتب]: تم صيد خبر جديد ونشره فوراً!`);
        const insertQuery = `INSERT INTO telegram_updates (category, content) VALUES ($1, $2) RETURNING *`;
        await pool.query(insertQuery, ['رواتب', lastMessage]);
    } catch (error) {
        console.error('❌ خطأ في قاعدة البيانات:', error.message);
    }
}
scrapeSalaries();
setInterval(scrapeSalaries, 40000); // يفحص كل 40 ثانية للسرعة القصوى اليوم!

// ==========================================
// 🧹 نظام الصيانة والتنظيف الذكي
// ==========================================
async function cleanOldData() {
    try {
        const deleteQuery = `DELETE FROM telegram_updates WHERE created_at < NOW() - INTERVAL '30 days';`;
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
        const result = await pool.query("SELECT * FROM telegram_updates ORDER BY created_at DESC LIMIT 15");
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