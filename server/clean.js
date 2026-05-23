const { Pool } = require('pg');

// ربط مباشر بقاعدة بياناتك حسب ملف الـ .env مالتك
const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'iraq_services',
    password: 'adminpassword', 
    port: 5432,
});

console.log("🧹 جاري فرمتة جدول الأخبار ومسح البيانات الوهمية...");

// أمر مسح كل البيانات من الجدول
pool.query('TRUNCATE TABLE updates;', (err, res) => {
    if (err) {
        console.error('❌ صار خطأ بعملية المسح:', err);
    } else {
        console.log('✅ تم تنظيف قاعدة البيانات بنجاح! الساحة هسه فريش وتلمع.');
    }
    // إغلاق الاتصال بعد الانتهاء
    pool.end();
});