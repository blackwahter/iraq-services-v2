const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios'); 
const cheerio = require('cheerio'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// إعدادات قاعدة البيانات (PostgreSQL - Neon Cloud)
// ==========================================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
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
// إعداد بوت تيليجرام الأساسي (للخاص والقناة)
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
        console.error('❌ خطأ أثناء الخزن:', err);
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
// 💸 نظام رادار البورصات المحلية (الجديد)
// ==========================================
let localBourses = {
    kifah: 146500,
    harthiya: 146500,
    erbil: 146700,
    basra: 146200,
    lastUpdated: null
};

// خوارزمية استخراج الرقم من النص (تصطاد الرقم بصف اسم المحافظة)
function extractIraqiRate(text, cityName) {
    const index = text.indexOf(cityName);
    if (index === -1) return null;
    // ناخذ النص اللي بعد اسم المحافظة بـ 40 حرف وندور بي على رقم الدولار
    const slice = text.substring(index, index + 40);
    // يبحث عن أرقام مثل 146500 أو 146,500 أو 146.50
    const match = slice.match(/1[3-7][0-9][.,]?[0-9]{2,3}/);
    if (match) {
        let cleanNum = match[0].replace(/[.,]/g, '');
        if (cleanNum.length === 5) cleanNum += '0'; // معالجة إذا كان مكتوب 14650
        return parseInt(cleanNum);
    }
    return null;
}

async function scrapeBourses() {
    try {
        // قناة مشهورة تنشر أسعار الصرف باستمرار
        const response = await axios.get('https://t.me/s/dollar_iraq_now');
        const $ = cheerio.load(response.data);
        const messages = $('.tgme_widget_message_text');
        
        if (messages.length === 0) return;

        // نفحص آخر 10 رسائل بالقناة
        let found = false;
        for (let i = messages.length - 1; i >= 0; i--) {
            const text = $(messages[i]).text();
            
            // إذا الرسالة بيها أسعار الكفاح أو الدولار
            if (text.includes('الكفاح') || text.includes('صرف')) {
                const k = extractIraqiRate(text, 'الكفاح');
                const h = extractIraqiRate(text, 'الحارثية');
                const e = extractIraqiRate(text, 'اربيل');
                const b = extractIraqiRate(text, 'البصرة');

                if (k) localBourses.kifah = k;
                if (h) localBourses.harthiya = h;
                else if (k) localBourses.harthiya = k; // الحارثية دائماً نفس الكفاح تقريباً
                if (e) localBourses.erbil = e;
                if (b) localBourses.basra = b;

                if (k || e || b) {
                    localBourses.lastUpdated = new Date().toISOString();
                    console.log('🎯 [رادار البورصة]: تم تحديث أسعار السوق المحلية بنجاح!', localBourses);
                    found = true;
                    break; // لكينا السعر، نطلع من اللوب
                }
            }
        }
    } catch (err) {
        console.error('❌ [رادار البورصة]: خطأ في الاتصال بقناة الأسعار.', err.message);
    }
}

// تشغيل الرادار كل 3 دقائق
scrapeBourses();
setInterval(scrapeBourses, 180000);

// ==========================================
// 📰 نظام سحب أخبار الرواتب (الذكي)
// ==========================================
async function scrapeTelegramChannel(channelUsername) {
    try {
        const url = `https://t.me/s/${channelUsername}`;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const messages = $('.tgme_widget_message_text');
        if (messages.length === 0) return; 

        const lastMessage = messages.last().text();

        const checkQuery = await pool.query('SELECT content FROM telegram_updates ORDER BY id DESC LIMIT 1');
        if (checkQuery.rows.length > 0 && checkQuery.rows[0].content === lastMessage) return; 

        const salaryKeywords = ['راتب', 'رواتب', 'تمويل', 'مصرف', 'متقاعدين', 'الرعاية', 'صرف', 'موظفي', 'المالية', 'سلفة', 'سلف'];
        const isSalaryNews = salaryKeywords.some(keyword => lastMessage.includes(keyword));

        if (!isSalaryNews) return; 

        console.log(`🔍 [نجاح]: تم سحب خبر رواتب جديد تلقائياً: ${lastMessage}`);
        const insertQuery = `INSERT INTO telegram_updates (category, content) VALUES ($1, $2) RETURNING *`;
        await pool.query(insertQuery, ['رواتب', lastMessage]);
    } catch (error) {
        console.error(`❌ خطأ أثناء السحب من القناة:`, error.message);
    }
}

setInterval(() => scrapeTelegramChannel('roatabn'), 60000);

// ==========================================
// 🧹 نظام التنظيف التلقائي لقاعدة البيانات (شهرياً)
// ==========================================
async function cleanOldMonthsData() {
    try {
        const deleteQuery = `DELETE FROM telegram_updates WHERE created_at < date_trunc('month', CURRENT_DATE);`;
        const result = await pool.query(deleteQuery);
        if (result.rowCount > 0) console.log(`🧹 [صيانة النظام]: تم مسح ${result.rowCount} أخبار قديمة!`);
    } catch (err) {}
}

cleanOldMonthsData();
setInterval(cleanOldMonthsData, 86400000); 

// ==========================================
// إعدادات خادم الـ API (Express)
// ==========================================
app.use(cors());
app.use(express.json());

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

// API التحديثات (الرواتب والـ Terminal)
app.get('/api/updates', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM telegram_updates ORDER BY created_at DESC LIMIT 10');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ في السيرفر' });
    }
});

// هذا الـ API يمسح كل الأخبار بضغطة زر
app.get('/api/clear-all', async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE telegram_updates;');
        console.log('🧹 تم مسح الداتابيس يدوياً عبر المتصفح!');
        res.json({ success: true, message: "تم مسح البيانات" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/nuke-all-data', async (req, res) => {
    try {
        // هذا الأمر يمسح الجدول ويعيد ترقيمه من الصفر
        await pool.query('TRUNCATE TABLE telegram_updates RESTART IDENTITY;');
        console.log('💥 تم نسف كل البيانات!');
        res.send("تم المسح بنجاح! طفي السيرفر وشغله.");
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// مسار الصفحة الرئيسية
app.get('/', (req, res) => {
    res.send('<h1 style="text-align: center; margin-top: 50px; font-family: tahoma;">🚀 سيرفر خدمات العراق يعمل بنجاح!</h1>');
});
app.listen(PORT, () => {
    console.log(`🌐 Server is running successfully on port ${PORT}`);
});