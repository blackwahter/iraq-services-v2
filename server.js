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
// 🛡️ صائد الانهيارات (منع توقف السيرفر عند الأخطاء المفاجئة)
// ==========================================
process.on('uncaughtException', (err) => {
    console.error('🔥 [طوارئ]: خطأ غير متوقع، تم منعه من إيقاف السيرفر!', err.message);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 [طوارئ]: رفض غير معالج في وعد (Promise)!', reason);
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
    } catch (err) {
        console.error('❌ Error creating tables:', err);
    }
};
initDB();

// ==========================================
// 🤖 إعداد بوت تيليجرام الأساسي (للخاص والقناة)
// ==========================================
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    if (msg.chat.type === 'channel') return;
    const chatId = msg.chat.id;
    const text = msg.text;
    if (!text) return; 

    let category = 'أخبار عامة';
    if (text.includes('ذهب') || text.includes('غرام')) category = 'ذهب';
    else if (text.includes('نفط') || text.includes('برميل')) category = 'نفط';

    try {
        const insertQuery = `INSERT INTO telegram_updates (category, content) VALUES ($1, $2) RETURNING *`;
        await pool.query(insertQuery, [category, text]);
        bot.sendMessage(chatId, `✅ تم استلام وحفظ تحديث (${category}) بنجاح!`);
    } catch (err) {
        console.error('❌ خطأ أثناء الخزن:', err.message);
    }
});

bot.on('channel_post', async (msg) => {
    const text = msg.text;
    if (!text) return; 

    let category = 'أخبار عامة';
    if (text.includes('ذهب') || text.includes('غرام') || text.includes('مثقال')) category = 'ذهب';
    else if (text.includes('نفط') || text.includes('برميل')) category = 'نفط';
    else if (text.includes('دولار') || text.includes('صرف')) category = 'عملات';

    try {
        const insertQuery = `INSERT INTO telegram_updates (category, content) VALUES ($1, $2) RETURNING *`;
        await pool.query(insertQuery, [category, text]);
    } catch (err) {}
});

// ==========================================
// 💸 نظام رادار البورصات المحلية (المزدوج والمدرع)
// ==========================================
// إعطاء قيمة ابتدائية لمنع خطأ "جاري المزامنة" في الواجهة
let localBourses = {
    kifah: 146500,
    harthiya: 146500,
    erbil: 146700,
    basra: 146200,
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
    try {
        // الخطة A: استخدام بروكسي للبحث المباشر وتخطي الإعلانات
        const targetUrl = encodeURIComponent('https://t.me/s/dollar_iraq_now?q=الكفاح');
        const proxyUrl = `https://api.allorigins.win/raw?url=${targetUrl}`;
        
        const response = await axios.get(proxyUrl, { timeout: 15000 });
        const $ = cheerio.load(response.data);
        const messages = $('.tgme_widget_message_text');
        
        if (messages.length === 0) throw new Error("No messages found via proxy");

        let found = false;
        for (let i = messages.length - 1; i >= 0; i--) {
            const text = $(messages[i]).text();
            
            if (text.includes('الكفاح') || text.includes('صرف')) {
                const k = extractIraqiRate(text, 'الكفاح');
                const h = extractIraqiRate(text, 'الحارثية');
                const e = extractIraqiRate(text, 'اربيل');
                const b = extractIraqiRate(text, 'البصرة');

                if (k) localBourses.kifah = k;
                if (h) localBourses.harthiya = h;
                else if (k) localBourses.harthiya = k; 
                if (e) localBourses.erbil = e;
                if (b) localBourses.basra = b;

                if (k || e || b) {
                    localBourses.lastUpdated = new Date().toISOString();
                    console.log('🎯 [رادار البورصة]: تم التحديث بنجاح (الخطة A)!', localBourses);
                    found = true;
                    break;
                }
            }
        }
    } catch (err) {
        // الخطة B: إذا فشل البروكسي، ننتقل فوراً لـ RSSHub
        try {
            const rssUrl = 'https://rsshub.app/telegram/channel/dollar_iraq_now';
            const res = await axios.get(rssUrl, { timeout: 15000 });
            const $ = cheerio.load(res.data, { xmlMode: true });
            const items = $('item');
            
            let found = false;
            items.each((i, el) => {
                if (found) return;
                const text = $(el).find('description').text();
                if (text.includes('الكفاح') || text.includes('صرف')) {
                    const k = extractIraqiRate(text, 'الكفاح');
                    if (k) {
                        localBourses.kifah = k;
                        localBourses.harthiya = extractIraqiRate(text, 'الحارثية') || k;
                        localBourses.erbil = extractIraqiRate(text, 'اربيل') || localBourses.erbil;
                        localBourses.basra = extractIraqiRate(text, 'البصرة') || localBourses.basra;
                        localBourses.lastUpdated = new Date().toISOString();
                        console.log('🎯 [رادار البورصة]: تم التحديث بنجاح (الخطة B - RSS)!');
                        found = true;
                    }
                }
            });
        } catch (e) {
            console.log('⚠️ [رادار البورصة]: جميع المصادر مشغولة، سيتم الإبقاء على الأسعار القديمة للمحاولة القادمة.');
        }
    }
}
scrapeBourses();
setInterval(scrapeBourses, 180000); // تحديث كل 3 دقائق

// ==========================================
// 📰 نظام سحب أخبار الرواتب (المحمي بـ RSS)
// ==========================================
async function scrapeSalaries() {
    try {
        const rssUrl = 'https://rsshub.app/telegram/channel/roatabn';
        const response = await axios.get(rssUrl, { timeout: 15000 });
        const $ = cheerio.load(response.data, { xmlMode: true });
        
        const firstItem = $('item').first();
        if (!firstItem) return;

        let lastMessage = firstItem.find('description').text();
        lastMessage = lastMessage.replace(/<[^>]+>/g, ' ').trim(); // تنظيف من أكواد HTML

        const checkQuery = await pool.query('SELECT content FROM telegram_updates ORDER BY id DESC LIMIT 1');
        if (checkQuery.rows.length > 0 && checkQuery.rows[0].content === lastMessage) return; 

        const salaryKeywords = ['راتب', 'رواتب', 'تمويل', 'مصرف', 'متقاعدين', 'الرعاية', 'صرف', 'موظفي', 'المالية', 'سلفة', 'سلف'];
        const isSalaryNews = salaryKeywords.some(keyword => lastMessage.includes(keyword));

        if (!isSalaryNews) return; 

        console.log(`🔍 [نجاح]: خبر رواتب جديد: ${lastMessage.substring(0, 50)}...`);
        const insertQuery = `INSERT INTO telegram_updates (category, content) VALUES ($1, $2) RETURNING *`;
        await pool.query(insertQuery, ['رواتب', lastMessage]);
    } catch (error) {
        console.log(`⚠️ [رواتب]: جاري انتظار الأخبار...`);
    }
}
scrapeSalaries();
setInterval(scrapeSalaries, 60000); // تحديث كل دقيقة

// ==========================================
// 🧹 نظام التنظيف التلقائي الذكي (لحماية مساحة الداتابيس)
// ==========================================
async function cleanOldData() {
    try {
        // يمسح الأخبار اللي مضى عليها أكثر من 30 يوم
        const deleteQuery = `DELETE FROM telegram_updates WHERE created_at < NOW() - INTERVAL '30 days';`;
        const result = await pool.query(deleteQuery);
        if (result.rowCount > 0) console.log(`🧹 [صيانة]: تم مسح ${result.rowCount} أخبار قديمة (أكثر من 30 يوم)!`);
    } catch (err) {
        console.error('❌ خطأ في عملية التنظيف:', err.message);
    }
}
cleanOldData();
setInterval(cleanOldData, 86400000); // فحص يومي

// ==========================================
// 🚀 إعدادات خادم الـ API (Express)
// ==========================================
app.use(cors());
app.use(express.json());

// 🩺 فحص نبض السيرفر (Health Check)
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', uptime: process.uptime(), timestamp: new Date() });
});

// API البورصات المحلية
app.get('/api/bourses', (req, res) => {
    res.json({ success: true, data: localBourses });
});

// API النفط العالمي
app.get('/api/oil', async (req, res) => {
    try {
        const brentReq = await axios.get('https://query1.finance.yahoo.com/v8/finance/chart/BZ=F');
        const brentPrice = brentReq.data.chart.result[0].meta.regularMarketPrice;
        const wtiReq = await axios.get('https://query1.finance.yahoo.com/v8/finance/chart/CL=F');
        const wtiPrice = wtiReq.data.chart.result[0].meta.regularMarketPrice;
        res.json({ success: true, brent: brentPrice, wti: wtiPrice });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// API التحديثات (الرواتب والأخبار)
app.get('/api/updates', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM telegram_updates ORDER BY created_at DESC LIMIT 15');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ في السيرفر' });
    }
});

// مسح كل الداتا يدوياً
app.get('/api/clear-all', async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE telegram_updates;');
        res.json({ success: true, message: "تم مسح البيانات" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// تصفير الجدول وإعادة الترقيم
app.get('/api/nuke-all-data', async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE telegram_updates RESTART IDENTITY;');
        res.send("تم المسح بنجاح! طفي السيرفر وشغله.");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// ==========================================
// ⏰ نظام منع النوم لسيرفرات Render المجانية
// ==========================================
setInterval(async () => {
    try {
        // السيرفر يزور نفسه كل 14 دقيقة حتى ما ينام
        await axios.get(`https://iraq-services-v2.onrender.com/api/health`);
    } catch (e) {
        // تجاهل الأخطاء الصامتة هنا
    }
}, 14 * 60 * 1000); 

// السماح للسيرفر بقراءة ملفات التصميم
app.use(express.static(__dirname));

// مسار الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`🌐 Server is running successfully on port ${PORT}`);
    console.log(`🚀 السيرفر محمي ومستعد للعمل 24/7`);
});