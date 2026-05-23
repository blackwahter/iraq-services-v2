const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios'); // بقيناه بس علمود النفط
require('dotenv').config();
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 🛡️ استيراد مكتبات الحساب المبرمج (UserBot)
// ==========================================
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");

// ==========================================
// 🗄️ إعدادات قاعدة البيانات (PostgreSQL - Neon)
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
    await pool.query(createTableQuery).catch(err => {});
};
initDB();

// ==========================================
// 🤖 بوت التحكم اليدوي (سيطرة المطور)
// ==========================================
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    if (msg.chat.type === 'channel') return;
    const chatId = msg.chat.id;
    const text = msg.text;
    if (!text) return; 

    // النشر اليدوي الفوري
    if (text.startsWith('راتب ')) {
        const news = text.replace('راتب ', '').trim();
        try {
            await pool.query(`INSERT INTO telegram_updates (category, content) VALUES ($1, $2)`, ['رواتب', news]);
            bot.sendMessage(chatId, `✅ تم إطلاق الخبر بالموقع فوراً!\nالخبر: ${news}`);
        } catch (err) { bot.sendMessage(chatId, `❌ خطأ: ${err.message}`); }
        return; 
    }

    let category = 'أخبار عامة';
    if (text.includes('ذهب') || text.includes('غرام')) category = 'ذهب';
    else if (text.includes('نفط') || text.includes('برميل')) category = 'نفط';

    try {
        await pool.query(`INSERT INTO telegram_updates (category, content) VALUES ($1, $2)`, [category, text]);
        bot.sendMessage(chatId, `✅ تم استلام وحفظ تحديث (${category}) بنجاح!`);
    } catch (err) {}
});

// ==========================================
// 🦅 نظام الاستخبارات والصيد الفوري (UserBot)
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

// ⚠️ خلي معلوماتك هنا بين الأقواس (لا تشاركها وية أحد)
const apiId = 31693594; // الـ API ID مالتك
const apiHash = "9ba82cfa52cc57470b2b1cc3ea619a0d"; // الـ API Hash مالتك
const stringSession = new StringSession("1AgAOMTQ5LjE1NC4xNjcuNTABu2AqxGKLKmTF4ip3f9ZwKAQaKH2jc1gRRplZ1lrRw+FPUi0vXmJ5hvLkapkueRCvnhu3HXF/IqtbArFewPIYqmAOnjxmeA+RYpwSc6FFJQLuVXjmb6dVWor5/WbCjurUtcM1UJuNizpiafBw6bYxns7JPFtWugcDgFoOvLTmT8Yr4oRKdYacWZY4X4iW+3ifM9lRDypbzwpKganzSlysVaMzffrGQfnSHQzp+jQ1yGp1MFNSLOsvSjIFBe9Y9Ilj6yYEiUtU17G8KA4CA4UVYUWqydawBEIDyx/GMdrAGH2KW63LhfOVcfEqGZrjnyjjKVPL7gN8FQNhngv27jA2fM0="); // الصق السشن الطويل هنا

const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
});

async function startUserBot() {
    try {
        await client.connect();
        console.log("✅ [UserBot]: الحساب المبرمج متصل ويعمل كحارس شخصي!");

        // استماع فوري لأي رسالة جديدة بالتليجرام
        client.addEventHandler(async (event) => {
            const message = event.message;
            if (!message || !message.text) return;
            
            const text = message.text;
            const chat = await event.getChat();
            const username = chat.username ? chat.username.toLowerCase() : '';

            // 1. صيد أخبار الرواتب فوراً من قناة الرواتب
            if (username === 'roatabn' || username === 'iraq_now') {
                const salaryKeywords = ['راتب', 'رواتب', 'تمويل', 'مصرف', 'متقاعدين', 'الرعاية', 'صرف', 'موظفي', 'المالية', 'سلفة', 'سلف', 'إطلاق', 'باشر', 'عاجل'];
                const isSalaryNews = salaryKeywords.some(keyword => text.includes(keyword));

                if (isSalaryNews) {
                    const checkQuery = await pool.query("SELECT content FROM telegram_updates WHERE category = 'رواتب' ORDER BY id DESC LIMIT 1");
                    if (checkQuery.rows.length === 0 || checkQuery.rows[0].content !== text) {
                        await pool.query(`INSERT INTO telegram_updates (category, content) VALUES ($1, $2)`, ['رواتب', text]);
                        console.log(`🎯 [تلقائي - صيد فوري]: تم نشر خبر الرواتب!`);
                    }
                }
            }

            // 2. صيد أسعار البورصة فوراً من قناة الدولار
            if (username === 'dollar_iraq_now') {
                if (text.includes('الكفاح') || text.includes('صرف')) {
                    const k = extractIraqiRate(text, 'الكفاح');
                    if (k) {
                        localBourses.kifah = k;
                        localBourses.harthiya = extractIraqiRate(text, 'الحارثية') || k;
                        localBourses.erbil = extractIraqiRate(text, 'اربيل') || localBourses.erbil;
                        localBourses.basra = extractIraqiRate(text, 'البصرة') || localBourses.basra;
                        localBourses.lastUpdated = new Date().toISOString();
                        console.log(`🎯 [تلقائي - صيد فوري]: تم تحديث البورصة!`);
                    }
                }
            }
        }, new NewMessage({})); // استماع لكل الرسائل الجديدة

    } catch (error) {
        console.error("❌ خطأ في اتصال الـ UserBot:", error.message);
    }
}
// تشغيل الحساب المبرمج
startUserBot();

// ==========================================
// 🧹 التنظيف و API السيرفر 
// ==========================================
setInterval(async () => {
    try { await pool.query(`DELETE FROM telegram_updates WHERE created_at < NOW() - INTERVAL '30 days';`); } catch (err) {}
}, 86400000); 

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
    } catch (err) { res.status(500).json({ error: 'حدث خطأ' }); }
});

app.get('/api/clear-all', async (req, res) => {
    try { await pool.query('TRUNCATE TABLE telegram_updates;'); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/nuke-all-data', async (req, res) => {
    try { await pool.query('TRUNCATE TABLE telegram_updates RESTART IDENTITY;'); res.send("تم المسح!"); } catch (err) { res.status(500).send(err.message); }
});

setInterval(async () => {
    try { await axios.get(`https://iraq-services-v2.onrender.com/api/health`); } catch (e) {}
}, 14 * 60 * 1000); 

app.use(express.static(__dirname));
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

app.listen(PORT, () => {
    console.log(`🌐 Server is running successfully on port ${PORT}`);
    console.log(`🚀 النظام المؤسساتي (UserBot) جاهز ومفعل 24/7`);
});